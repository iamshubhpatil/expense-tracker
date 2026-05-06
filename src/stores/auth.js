import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const isHydrated = ref(false)
  const successMessage = ref(null)

  const userRole = computed(() => user.value?.role || user.value?.user_metadata?.role || 'user')

  const setUser = (userData) => {
    user.value = userData
  }

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
        isAuthenticated.value = true
      }
    } catch (e) {
      console.error('Failed to initialize auth', e)
    }
    isHydrated.value = true
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      user.value = session.user
      isAuthenticated.value = true
    } else {
      user.value = null
      isAuthenticated.value = false
    }
  })

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      user.value = data.user
      isAuthenticated.value = true
      successMessage.value = 'Login successful'
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (email, password, userData) => {
    isLoading.value = true
    error.value = null
    try {
      const redirectBase = import.meta.env.VITE_APP_URL || window.location.origin
      const signupOptions = {
        data: userData,
      }

      if (redirectBase) {
        signupOptions.emailRedirectTo = `${redirectBase}/verify-email`
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: signupOptions,
      })
      if (authError) throw authError
      successMessage.value = 'Signup successful. Please check your email to verify your account.'
      return { success: true, user: data.user }
    } catch (err) {
      error.value = err.message
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      isAuthenticated.value = false
      successMessage.value = 'You have been logged out successfully'
      try {
        localStorage.setItem('theme', 'light')
        document.documentElement.classList.remove('dark')
      } catch (e) {
        // ignore in non-browser environments
      }
      setTimeout(() => {
        router.push('/')
        successMessage.value = null
      }, 500)
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  const setError = (errorMsg) => {
    error.value = errorMsg
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    successMessage,
    isHydrated,
    userRole,
    initializeAuth,
    login,
    signup,
    logout,
    setError,
  }
})
