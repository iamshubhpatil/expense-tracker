<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-lavender-200 dark:bg-lavender-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

    <div class="w-full max-w-md">
      <template v-if="!emailSent">
        <!-- Header Section -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-lavender-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
              ✨
            </div>
          </div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-lavender-600 to-purple-600 bg-clip-text text-transparent mb-2">Create Account</h1>
          <p class="text-gray-600 dark:text-gray-400">Join thousands managing their finances</p>
        </div>

        <!-- Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 border border-lavender-100 dark:border-lavender-900">
          <!-- Error Message Display -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p class="font-semibold text-red-700 dark:text-red-400">Signup failed</p>
                <p class="text-red-600 dark:text-red-300 text-sm mt-1">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">First Name</label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  maxlength="50"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="John"
                  @input="(e) => { formData.firstName = formData.firstName.replace(/[^A-Za-z\s'-]/g, ''); errorMessage = '' }"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Last Name</label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  maxlength="50"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Doe"
                  @input="(e) => { formData.lastName = formData.lastName.replace(/[^A-Za-z\s'-]/g, ''); errorMessage = '' }"
                />
              </div>
            </div>

            <!-- Email Field -->
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-lavender-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Email Address
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="you@example.com"
                @input="errorMessage = ''"
              />
            </div>

            <!-- Password Field -->
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-lavender-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Password
              </label>
              <div class="relative">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••"
                  @input="errorMessage = ''"
                />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword" 
                  class="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  tabindex="-1"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.19-2.897A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.064 10.064 0 01-5.677 4.118"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">8-32 characters, with uppercase, lowercase and special character</p>
            </div>

            <!-- Confirm Password Field -->
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-lavender-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m7.5-1.5a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Confirm Password
              </label>
              <div class="relative">
                <input
                  v-model="formData.confirmPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 dark:focus:ring-lavender-900 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••"
                  @input="errorMessage = ''"
                />
                <button 
                  type="button" 
                  @click="showConfirm = !showConfirm" 
                  class="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  tabindex="-1"
                >
                  <svg v-if="!showConfirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.19-2.897A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.064 10.064 0 01-5.677 4.118"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sign Up Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-lavender-600 to-purple-600 hover:from-lavender-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-6"
            >
              <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">Already registered?</span>
            </div>
          </div>

          <!-- Login Link -->
          <router-link 
            to="/login" 
            class="w-full block text-center px-4 py-3 border-2 border-lavender-200 dark:border-lavender-800 text-lavender-600 dark:text-lavender-400 font-semibold rounded-xl hover:bg-lavender-50 dark:hover:bg-lavender-900/20 transition-all duration-200"
          >
            Sign In Instead
          </router-link>
        </div>
      </template>

      <!-- Email Verification Section -->
      <template v-else>
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-4xl">
              ✓
            </div>
          </div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Almost there!</h1>
          <p class="text-gray-600 dark:text-gray-400">Verify your email to complete signup</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-green-100 dark:border-green-900">
          <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
            <p class="text-gray-800 dark:text-gray-200">We sent a verification link to:</p>
            <p class="text-lg font-semibold text-green-600 dark:text-green-400 break-all mt-2">{{ sentEmail }}</p>
          </div>

          <ol class="space-y-3 mb-8 text-gray-700 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 bg-lavender-600 text-white rounded-full flex-shrink-0 text-sm font-bold">1</span>
              <span>Check your email inbox</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 bg-lavender-600 text-white rounded-full flex-shrink-0 text-sm font-bold">2</span>
              <span>Click the verification link</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 bg-lavender-600 text-white rounded-full flex-shrink-0 text-sm font-bold">3</span>
              <span>Complete your account setup</span>
            </li>
          </ol>

          <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
            Please check your inbox for the verification email. If you do not receive it, check your spam folder or try signing up again.
          </div>

          <router-link to="/login" class="block text-center mt-4 text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300 font-semibold">
            ← Back to Login
          </router-link>
        </div>
      </template>

      <!-- Footer -->
      <div v-if="!emailSent" class="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p>Free forever • No credit card required</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const emailSent = ref(false)
const sentEmail = ref('')
const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
})
const showPassword = ref(false)
const showConfirm = ref(false)

const handleSubmit = async () => {
  // Basic client-side validation
  const nameRegex = /^[A-Za-z\s'\-]+$/
  if (!nameRegex.test(formData.value.firstName || '')) {
    errorMessage.value = 'First name can contain only letters, spaces, apostrophes and hyphens'
    return
  }
  if (!nameRegex.test(formData.value.lastName || '')) {
    errorMessage.value = 'Last name can contain only letters, spaces, apostrophes and hyphens'
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  // Password policy: 8-32 chars, at least one upper, one lower, one special
  const pwdRegex = /^(?=.{8,32}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/
  if (!pwdRegex.test(formData.value.password)) {
    errorMessage.value = 'Password must be 8–32 characters and include uppercase, lowercase and a special character'
    return
  }

  // First and last name must not be identical
  if (formData.value.firstName && formData.value.lastName && formData.value.firstName.trim().toLowerCase() === formData.value.lastName.trim().toLowerCase()) {
    errorMessage.value = 'First name and last name must not be the same'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const userData = {
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
    }
    const result = await authStore.signup(formData.value.email, formData.value.password, userData)
    if (result.success) {
      emailSent.value = true
      sentEmail.value = formData.value.email
      // Optionally clear sensitive fields
      formData.value.password = ''
      formData.value.confirmPassword = ''
    } else {
      errorMessage.value = authStore.error
    }
  } catch (error) {
    errorMessage.value = error.message || 'Signup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

</script>

