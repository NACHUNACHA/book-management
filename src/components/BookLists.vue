<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchWithAuth } from '@/utils/fetchWrapper'

const books = ref([])
const error = ref('')
const genres = ref([])
const user = ref(null)

const showModal = ref(false)
const newBook = ref({
  title: '',
  author: '',
  published_year: '',
  genres_id: '',
})

function openModal() {
  showModal.value = true
  error.value = ''
}
function closeModal() {
  showModal.value = false
  newBook.value = { title: '', author: '', published_year: '', genres_id: '' }
  error.value = ''
}

async function createBook() {
  try {
    error.value = ''
    // Validate fields
    if (
      !newBook.value.title ||
      !newBook.value.author ||
      !newBook.value.published_year ||
      !newBook.value.genres_id
    ) {
      error.value = 'All fields are required.'
      return
    }
    const response = await fetchWithAuth('/books', {
      method: 'POST',
      body: JSON.stringify({
        ...newBook.value,
        published_year: Number(newBook.value.published_year),
      }),
    })
    if (!response.ok) {
      const errData = await response.json()
      error.value = errData.message || 'Failed to create book'
      return
    }
    const created = await response.json()
    books.value.genres.name = genres.value.find((g) => g.id === created.genres_id)
    books.value.unshift(created)
    closeModal()
  } catch (err) {
    error.value = 'Failed to create book.'
    console.error(err)
  }
}

async function deleteBook(bookID) {
  try {
    if (confirm('Do you want to delete this book?')) {
      const response = await fetchWithAuth(`/books/${bookID}`, {
        method: 'DELETE',
      })

      if (response.status === 204) {
        alert('Deleted book successfully.')
        books.value = books.value.filter((book) => book.id !== bookID)
        if (paginatedBooks.value.length === 0 && currentPage.value > 1) {
          currentPage.value--
        }
      }
    }
  } catch (err) {
    error.value = 'Failed to delete book.'
    console.error(err)
  }
}
const currentPage = ref(1)
const itemsPerPage = ref(6)

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return books.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(books.value.length / itemsPerPage.value)
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

async function fetchBook() {
  try {
    const response = await fetchWithAuth('/books', { method: 'GET' })
    if (!response.ok) {
      const errData = await response.json()
      error.value = errData.message || 'Failed to fetch books'
      return
    }
    books.value = await response.json()
  } catch (err) {
    error.value = 'Error fetching books'
    console.error('Error fetching books:', err)
  }
}

async function fetchGenres() {
  try {
    const response = await fetchWithAuth('/genres', { method: 'GET' })
    if (!response.ok) {
      const errData = await response.json()
      error.value = errData.message || 'Failed to fetch genres'
      return
    }
    genres.value = await response.json()
  } catch (err) {
    error.value = 'Error fetching genres'
    console.error('Error fetching genres:', err)
  }
}

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user')).role
  fetchBook()
  fetchGenres()
})
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold mb-6">Book List</h1>
      <div v-if="user === 'admin'">
        <button
          @click="openModal"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add new book
        </button>
      </div>
    </div>
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>
    <div v-if="paginatedBooks.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in paginatedBooks"
        :key="book.id"
        class="bg-white rounded-lg shadow p-6 flex flex-col"
      >
        <router-link
          :to="{ name: 'book-details', params: { id: book.id } }"
          class="text-blue-600 hover:underline mb-2"
        >
          <h2 class="text-lg font-semibold mb-2">{{ book?.title }}</h2>
        </router-link>
        <p class="text-gray-700 mb-1">
          Author: <span class="font-medium">{{ book?.author }}</span>
        </p>
        <p class="text-gray-700 mb-1">
          Genre: <span class="font-medium">{{ book?.genres?.name }}</span>
        </p>
        <p class="text-gray-500 text-sm mb-2">Published year: {{ book?.published_year }}</p>

        <div v-if="user === 'admin'" class="mt-2 flex gap-2">
          <button
            @click="$router.push({ name: 'book-details', params: { id: book.id } })"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            @click="deleteBook(book.id)"
            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="!error" class="text-gray-500">No books found.</div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      >
        Prev
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-3 py-1 rounded border',
          page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200',
        ]"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <!-- Add Book Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Add New Book</h2>
        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="title"> Title </label>
          <input
            v-model="newBook.title"
            class="border rounded-md p-2 w-full"
            type="text"
            id="title"
            placeholder="Enter book title"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="author"> Author </label>
          <input
            v-model="newBook.author"
            class="border rounded-md p-2 w-full"
            type="text"
            id="author"
            placeholder="Enter author name"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="published_year">
            Published Year
          </label>
          <input
            v-model="newBook.published_year"
            class="border rounded-md p-2 w-full"
            type="number"
            id="published_year"
            placeholder="Enter published year"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="genres_id">
            Genre
          </label>
          <select v-model="newBook.genres_id" class="border rounded-md p-2 w-full" id="genres_id">
            <option value="">Select a genre</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button
            @click="closeModal"
            class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            @click="createBook"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Add Book
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
