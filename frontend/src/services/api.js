import axios from 'axios'

export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aisc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('aisc_token')
      localStorage.removeItem('aisc_user')
    }
    return Promise.reject(err)
  },
)

// --- Auth ---
export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api
      .post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data)
  },
}

// --- Notes ---
export const notesApi = {
  list: (q = '') => api.get('/notes', { params: q ? { q } : {} }).then((r) => r.data),
  get: (id) => api.get(`/notes/${id}`).then((r) => r.data),
  create: (data) => api.post('/notes', data).then((r) => r.data),
  update: (id, data) => api.put(`/notes/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/notes/${id}`).then((r) => r.data),
  summarize: (id) => api.post(`/notes/${id}/summarize`).then((r) => r.data),
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post('/notes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}

// --- Chat ---
export const chatApi = {
  send: (messages, noteId = null) =>
    api.post('/chat', { messages, note_id: noteId }).then((r) => r.data),

  /**
   * Stream an assistant reply. Calls `onChunk(text)` with each delta.
   * Returns a Promise that resolves when the stream ends.
   */
  stream: async (messages, noteId, onChunk, { signal } = {}) => {
    const token = localStorage.getItem('aisc_token')
    const res = await fetch(`${baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, note_id: noteId }),
      signal,
    })
    if (!res.ok || !res.body) {
      throw new Error(`Stream failed (${res.status})`)
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }))
    }
  },
}

// --- Progress ---
export const progressApi = {
  list: () => api.get('/progress').then((r) => r.data),
  upsert: (data) => api.post('/progress', data).then((r) => r.data),
  remove: (id) => api.delete(`/progress/${id}`).then((r) => r.data),
  recommendations: () => api.get('/progress/recommendations').then((r) => r.data),
}

// --- Flashcards ---
export const flashcardsApi = {
  list: () => api.get('/flashcards').then((r) => r.data),
  get: (id) => api.get(`/flashcards/${id}`).then((r) => r.data),
  create: (data) => api.post('/flashcards', data).then((r) => r.data),
  generate: (noteId, count = 8, name) =>
    api
      .post('/flashcards/generate', { note_id: noteId, count, name })
      .then((r) => r.data),
  remove: (id) => api.delete(`/flashcards/${id}`).then((r) => r.data),
  review: (cardId, rating) =>
    api.post(`/flashcards/cards/${cardId}/review`, { rating }).then((r) => r.data),
}

// --- Activity ---
export const activityApi = {
  log: (payload = { minutes: 1, cards_reviewed: 0 }) =>
    api.post('/activity/log', payload).then((r) => r.data),
  summary: () => api.get('/activity/summary').then((r) => r.data),
}
