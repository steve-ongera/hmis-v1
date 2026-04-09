const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Token management
export const getToken = () => localStorage.getItem('hmis_token')
export const setToken = (token) => localStorage.setItem('hmis_token', token)
export const removeToken = () => { localStorage.removeItem('hmis_token'); localStorage.removeItem('hmis_user') }
export const getUser = () => { try { return JSON.parse(localStorage.getItem('hmis_user')) } catch { return null } }
export const setUser = (user) => localStorage.setItem('hmis_user', JSON.stringify(user))

// Base request
async function request(method, endpoint, data = null, params = null) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  })

  if (res.status === 401) {
    removeToken()
    window.location.href = '/'
    return
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || json.detail || JSON.stringify(json) || 'Request failed')
  return json
}

const get = (url, params) => request('GET', url, null, params)
const post = (url, data) => request('POST', url, data)
const patch = (url, data) => request('PATCH', url, data)
const put = (url, data) => request('PUT', url, data)
const del = (url) => request('DELETE', url)

// Auth
export const api = {
  auth: {
    login: (credentials) => post('/auth/login/', credentials),
    me: () => get('/auth/me/'),
  },

  stats: {
    dashboard: () => get('/stats/'),
  },

  patients: {
    list: (params) => get('/patients/', params),
    get: (id) => get(`/patients/${id}/`),
    create: (data) => post('/patients/', data),
    update: (id, data) => patch(`/patients/${id}/`, data),
    delete: (id) => del(`/patients/${id}/`),
  },

  visits: {
    list: (params) => get('/visits/', params),
    get: (id) => get(`/visits/${id}/`),
    create: (data) => post('/visits/', data),
    update: (id, data) => patch(`/visits/${id}/`, data),
    updateStatus: (id, status) => patch(`/visits/${id}/update_status/`, { status }),
  },

  triage: {
    list: () => get('/triages/'),
    get: (id) => get(`/triages/${id}/`),
    create: (data) => post('/triages/', data),
    update: (id, data) => patch(`/triages/${id}/`, data),
  },

  consultations: {
    list: () => get('/consultations/'),
    get: (id) => get(`/consultations/${id}/`),
    create: (data) => post('/consultations/', data),
    update: (id, data) => patch(`/consultations/${id}/`, data),
  },

  prescriptions: {
    list: (params) => get('/prescriptions/', params),
    create: (data) => post('/prescriptions/', data),
    update: (id, data) => patch(`/prescriptions/${id}/`, data),
  },

  drugs: {
    list: (params) => get('/drugs/', params),
    get: (id) => get(`/drugs/${id}/`),
    create: (data) => post('/drugs/', data),
    update: (id, data) => patch(`/drugs/${id}/`, data),
  },

  bills: {
    list: (params) => get('/bills/', params),
    get: (id) => get(`/bills/${id}/`),
    create: (data) => post('/bills/', data),
    addItem: (id, data) => post(`/bills/${id}/add_item/`, data),
    processPayment: (id, data) => post(`/bills/${id}/process_payment/`, data),
    dispense: (id) => post(`/bills/${id}/dispense/`, {}),
  },

  wards: {
    list: () => get('/wards/'),
    get: (id) => get(`/wards/${id}/`),
    create: (data) => post('/wards/', data),
  },

  beds: {
    list: (params) => get('/beds/', params),
  },

  admissions: {
    list: (params) => get('/admissions/', params),
    get: (id) => get(`/admissions/${id}/`),
    create: (data) => post('/admissions/', data),
    discharge: (id, data) => post(`/admissions/${id}/discharge/`, data),
  },

  users: {
    list: () => get('/users/'),
    create: (data) => post('/users/', data),
    update: (id, data) => patch(`/users/${id}/`, data),
  },
}

export default api