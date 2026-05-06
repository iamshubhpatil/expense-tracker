import axios from 'axios'
import { supabase } from '@/lib/supabase'

const rawApiUrl = import.meta.env.VITE_API_URL
const apiBaseURL = rawApiUrl
  ? rawApiUrl.replace(/\/+|\s+/g, '').endsWith('/api')
    ? rawApiUrl.replace(/\/+|\s+/g, '')
    : `${rawApiUrl.replace(/\/+|\s+/g, '')}/api`
  : '/api'

const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
})

// Request interceptor to add token from Supabase session
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
