const FETCH_URL = import.meta.env.VITE_FETCH_URL

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  }

  const opts = {
    ...options,
    headers,
  }

  const response = await fetch(`${FETCH_URL}${url}`, opts)
  return response
}
