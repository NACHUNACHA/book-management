<script setup>
import { ref } from 'vue'
const FETCH_URL = import.meta.env.VITE_FETCH_URL

const isAuthenticated = ref(!!localStorage.getItem('token'))
const state = ref('login')
const username = ref('')
const password = ref('')
const error = ref('')

async function register() {
  try {
    const response = await fetch(`${FETCH_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      error.value = data.message || 'Registration failed'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    isAuthenticated.value = true
    error.value = ''
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

async function login() {
  try {
    const response = await fetch(`${FETCH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.message || 'Login failed'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    isAuthenticated.value = true
    error.value = ''
  } catch (err) {
    console.error('Login failed:', err)
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div v-if="isAuthenticated" class="w-full">
      <slot />
    </div>
    <div v-else class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="flex justify-center mb-6 gap-4">
        <button
          @click="state = 'login'"
          :class="[
            'px-4 py-2 rounded font-semibold transition',
            state === 'login'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Login
        </button>
        <button
          @click="state = 'register'"
          :class="[
            'px-4 py-2 rounded font-semibold transition',
            state === 'register'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Register
        </button>
      </div>
      <div v-if="state === 'register'">
        <h2 class="text-xl font-bold mb-4 text-center">Register</h2>
        <form @submit.prevent="register" class="space-y-4">
          <div>
            <label for="login-username" class="block mb-1 font-medium">Username</label>
            <input
              id="login-username"
              v-model="username"
              type="text"
              required
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label for="register-password" class="block mb-1 font-medium">Password</label>
            <input
              id="register-password"
              v-model="password"
              type="password"
              required
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Register
          </button>
        </form>
      </div>
      <div v-else>
        <h2 class="text-xl font-bold mb-4 text-center">Login</h2>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label for="login-username" class="block mb-1 font-medium">Username</label>
            <input
              id="login-username"
              v-model="username"
              type="text"
              required
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label for="login-password" class="block mb-1 font-medium">Password</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              required
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
      <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
    </div>
  </div>
</template>
