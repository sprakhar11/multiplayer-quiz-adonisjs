// central api helper — all backend calls go through here
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

function getTokens() {
  const raw = localStorage.getItem('tokens')
  return raw ? JSON.parse(raw) : null
}

function saveTokens(tokens) {
  localStorage.setItem('tokens', JSON.stringify(tokens))
}

function clearTokens() {
  localStorage.removeItem('tokens')
}

async function request(path, options = {}) {
  const tokens = getTokens()
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw { status: res.status, ...data }
  }
  return data
}

// multipart upload (no content-type header, browser sets it)
async function upload(path, formData) {
  const tokens = getTokens()
  const headers = {}
  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

// auth
export const register = (full_name, email, password) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify({ full_name, email, password }) })

export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const refreshToken = (refresh_token) =>
  request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) })

export const logout = (refresh_token) =>
  request('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token }) })

// profile
export const getProfile = () => request('/api/users/profile')
export const updateProfile = (full_name) =>
  request('/api/users/profile', { method: 'PUT', body: JSON.stringify({ full_name }) })
export const uploadPicture = (file) => {
  const fd = new FormData()
  fd.append('picture', file)
  return upload('/api/users/profile/picture', fd)
}

// quizzes
export const getQuizzes = () => request('/api/quizzes')

// sessions
export const startSession = (quiz_id, mode) =>
  request('/api/sessions/start', { method: 'POST', body: JSON.stringify({ quiz_id, mode }) })
export const joinSession = (invite_code) =>
  request('/api/sessions/join', { method: 'POST', body: JSON.stringify({ invite_code }) })
export const getResults = (sessionId) => request(`/api/sessions/${sessionId}/results`)

// leaderboard
export const getLeaderboard = () => request('/api/leaderboard')

export { getTokens, saveTokens, clearTokens, API_URL }
