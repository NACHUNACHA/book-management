<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchWithAuth } from '@/utils/fetchWrapper'
import { formatDate } from '@/utils/dateFormatter'

const route = useRoute()
const bookId = route.params.id
const user = ref('')
const book = ref(null)
const genres = ref([])
const error = ref('')
const success = ref('')
const isEditing = ref(false)
const editedBook = ref({})

async function fetchBook() {
  try {
    const response = await fetchWithAuth(`/books/${bookId}`, { method: 'GET' })
    if (!response.ok) {
      const errData = await response.json()
      error.value = errData.message || 'Failed to fetch book details'
      return
    }
    book.value = await response.json()
    editedBook.value = JSON.parse(JSON.stringify(book.value)) // deep copy
  } catch (err) {
    error.value = 'Error fetching book details'
    console.error('Error fetching book details:', err)
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

function startEdit() {
  isEditing.value = true
  editedBook.value = JSON.parse(JSON.stringify(book.value))
  error.value = ''
  success.value = ''
}

function cancelEdit() {
  isEditing.value = false
  editedBook.value = JSON.parse(JSON.stringify(book.value))
  error.value = ''
  success.value = ''
}

async function saveEdit() {
  try {
    error.value = ''
    success.value = ''
    const original = book.value
    const edited = editedBook.value
    const data = {}

    if (edited.title !== original.title) data.title = edited.title
    if (edited.author !== original.author) data.author = edited.author
    if (edited.published_year !== original.published_year)
      data.published_year = Number(edited.published_year)
    if (edited.genres?.id !== original.genres?.id) data.genres_id = edited.genres.id

    // Always send last_updated_by
    data.last_updated_by = JSON.parse(localStorage.getItem('user')).id

    if (Object.keys(data).length === 1) {
      // Only last_updated_by changed
      error.value = 'No changes detected.'
      return
    }

    const response = await fetchWithAuth(`/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errData = await response.json()
      error.value = errData.message || 'Failed to update book'
      return
    }
    book.value = await response.json()
    isEditing.value = false
    success.value = 'Book updated successfully.'
  } catch (err) {
    error.value = 'Error updating book'
    console.error('Error updating book:', err)
  }
}
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Book Details</h1>
    <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>
    <p v-if="success" class="text-green-600 mb-4">{{ success }}</p>
    <div v-if="book">
      <div v-if="!isEditing">
        <p class="mb-2"><strong>Title:</strong> {{ book.title }}</p>
        <p class="mb-2"><strong>Author:</strong> {{ book.author }}</p>
        <p class="mb-2"><strong>Genre:</strong> {{ book.genres?.name }}</p>
        <p class="mb-2"><strong>Published Year:</strong> {{ book.published_year }}</p>
        <p class="mb-2"><strong>Updated by:</strong> {{ book.users?.username }}</p>
        <p class="mb-2"><strong>Created at:</strong> {{ formatDate(book.created_at) }}</p>
        <p class="mb-2"><strong>Updated at:</strong> {{ formatDate(book.updated_at) }}</p>
        <div class="flex gap-2">
          <button
            @click="$router.push({ name: 'home' })"
            class="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-600 transition"
          >
            Back
          </button>
          <button
            v-if="user === 'admin'"
            @click="startEdit"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
        </div>
      </div>
      <div v-else>
        <form @submit.prevent="saveEdit">
          <label class="block mb-2">
            Title:
            <input v-model.trim="editedBook.title" class="border rounded px-2 py-1 w-full" />
          </label>
          <label class="block mb-2">
            Author:
            <input v-model.trim="editedBook.author" class="border rounded px-2 py-1 w-full" />
          </label>
          <label class="block mb-2">
            Genre:
            <select v-model="editedBook.genres.id" class="border rounded px-2 py-1 w-full">
              <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                {{ genre.name }}
              </option>
            </select>
          </label>
          <label class="block mb-2">
            Published Year:
            <input
              v-model.trim="editedBook.published_year"
              class="border rounded px-2 py-1 w-full"
            />
          </label>
          <div class="flex gap-2 mt-4">
            <button
              type="submit"
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              type="button"
              @click="cancelEdit"
              class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-else-if="!error" class="text-gray-500">Loading...</div>
  </div>
</template>
