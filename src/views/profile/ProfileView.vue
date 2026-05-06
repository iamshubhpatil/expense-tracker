<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
        <div class="space-y-6">
          <router-link
            to="/dashboard"
            class="flex items-center justify-between p-4 border-2 border-lavender-200 rounded-lg hover:bg-lavender-50 dark:hover:bg-gray-700 dark:border-lavender-700 transition bg-gradient-to-r from-lavender-50 dark:from-gray-700 to-transparent group"
          >
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white group-hover:text-lavender-600">← Back to Dashboard</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Return to your financial overview</p>
            </div>
          </router-link>

          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your profile information</p>
          </div>

          <!-- Profile Card Edit -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 space-y-6">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-lavender-400 to-lavender-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                👤
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ profileForm.firstName || profileForm.lastName ? `${profileForm.firstName} ${profileForm.lastName}`.trim() : 'User Profile' }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Personal Expense Tracker Account</p>
              </div>
              <button
                @click="isEditingProfile = !isEditingProfile"
                class="px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg transition font-medium text-sm"
              >
                {{ isEditingProfile ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>

            <!-- Display Mode -->
            <div v-if="!isEditingProfile" class="space-y-4">
              <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <p class="text-gray-900 dark:text-white">{{ profileForm.firstName }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <p class="text-gray-900 dark:text-white">{{ profileForm.lastName }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <p class="text-gray-900 dark:text-white">{{ userEmail }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Status</label>
                    <span class="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Since</label>
                    <p class="text-gray-900 dark:text-white">{{ memberSince }}</p>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Accounts</label>
                    <p class="text-2xl font-bold text-lavender-600 dark:text-lavender-400">{{ totalAccounts }}</p>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                      <p class="text-gray-900 dark:text-white">{{ currencySymbol }} {{ preferredCurrency }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-if="isEditingProfile" class="border-t border-gray-200 dark:border-gray-600 pt-6">
              <form @submit.prevent="updateProfile" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <input v-model="profileForm.firstName" type="text" maxlength="50" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <input v-model="profileForm.lastName" type="text" maxlength="50" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    disabled
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div class="flex gap-3 pt-4">
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    @click="isEditingProfile = false"
                    class="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Change Password Section -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>
            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <div class="relative">
                  <input
                    v-model="passwordForm.currentPassword"
                    :type="showCurrent ? 'text' : 'password'"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    placeholder="Enter current password"
                  />
                  <button type="button" @click="showCurrent = !showCurrent" class="absolute right-2 top-2 text-gray-400 hover:text-gray-200">
                    <svg v-if="!showCurrent" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 6.11 0 10c1.73 3.89 5 7 10 7s8.27-3.11 10-7c-1.73-3.89-5-7-10-7zM10 15a5 5 0 110-10 5 5 0 010 10z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.1 3.5L1 4.6l3.1 3.1C3.4 9 2.1 10.8 1 12c1.7 3.9 5 7 10 7 1.5 0 2.9-.3 4.2-.9l3.1 3.1 1.1-1.1L2.1 3.5zM7.7 9.3l1.6 1.6A3 3 0 0012 14a3 3 0 003-3c0-.6-.2-1.1-.5-1.6l1.6 1.6C16.6 12.6 14.4 14 12 14c-1 0-1.9-.3-2.7-.8L7.7 9.3z"/></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <div class="relative">
                  <input
                    v-model="passwordForm.newPassword"
                    :type="showNew ? 'text' : 'password'"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    placeholder="Enter new password"
                  />
                  <button type="button" @click="showNew = !showNew" class="absolute right-2 top-2 text-gray-400 hover:text-gray-200">
                    <svg v-if="!showNew" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 6.11 0 10c1.73 3.89 5 7 10 7s8.27-3.11 10-7c-1.73-3.89-5-7-10-7zM10 15a5 5 0 110-10 5 5 0 010 10z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.1 3.5L1 4.6l3.1 3.1C3.4 9 2.1 10.8 1 12c1.7 3.9 5 7 10 7 1.5 0 2.9-.3 4.2-.9l3.1 3.1 1.1-1.1L2.1 3.5zM7.7 9.3l1.6 1.6A3 3 0 0012 14a3 3 0 003-3c0-.6-.2-1.1-.5-1.6l1.6 1.6C16.6 12.6 14.4 14 12 14c-1 0-1.9-.3-2.7-.8L7.7 9.3z"/></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <div class="relative">
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPwd ? 'text' : 'password'"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    placeholder="Confirm new password"
                  />
                  <button type="button" @click="showConfirmPwd = !showConfirmPwd" class="absolute right-2 top-2 text-gray-400 hover:text-gray-200">
                    <svg v-if="!showConfirmPwd" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 6.11 0 10c1.73 3.89 5 7 10 7s8.27-3.11 10-7c-1.73-3.89-5-7-10-7zM10 15a5 5 0 110-10 5 5 0 010 10z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.1 3.5L1 4.6l3.1 3.1C3.4 9 2.1 10.8 1 12c1.7 3.9 5 7 10 7 1.5 0 2.9-.3 4.2-.9l3.1 3.1 1.1-1.1L2.1 3.5zM7.7 9.3l1.6 1.6A3 3 0 0012 14a3 3 0 003-3c0-.6-.2-1.1-.5-1.6l1.6 1.6C16.6 12.6 14.4 14 12 14c-1 0-1.9-.3-2.7-.8L7.7 9.3z"/></svg>
                  </button>
                </div>
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg transition font-medium"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  @click="resetPasswordForm"
                  class="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="logout"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
import apiClient from '@/lib/api'
import { getPreferredCurrency, getCurrencySymbol, formatDate } from '@/lib/utils'

const router = useRouter()
const authStore = useAuthStore()

const isEditingProfile = ref(false)
const userEmail = ref('user@example.com')
const memberSince = ref('')
const totalAccounts = ref(0)

// Currency shown on profile should reflect user's preferred currency set in Settings
const preferredCurrency = ref(getPreferredCurrency())
const currencySymbol = getCurrencySymbol(preferredCurrency.value)

const profileForm = ref({
  email: '',
  firstName: '',
  lastName: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirmPwd = ref(false)

const fetchUserData = async () => {
  try {
    const [profileRes, accountsRes] = await Promise.all([
      apiClient.get('/auth/profile'),
      apiClient.get('/accounts'),
    ])
    userEmail.value = profileRes.data.data?.email || 'user@example.com'
    profileForm.value.email = userEmail.value
    profileForm.value.firstName = profileRes.data.data?.first_name || ''
    profileForm.value.lastName = profileRes.data.data?.last_name || ''
    memberSince.value = formatDate(profileRes.data.data?.created_at) || ''
    totalAccounts.value = accountsRes.data.data?.length || 0
  } catch (error) {
    console.error('Failed to load user data', error)
  }
}

const updateProfile = async () => {
  // Client-side validation: same rules as backend
  const nameRegex = /^[A-Za-z\s'\-]+$/
  if (profileForm.value.firstName && !nameRegex.test(profileForm.value.firstName)) {
    alert('First name contains invalid characters')
    return
  }
  if (profileForm.value.lastName && !nameRegex.test(profileForm.value.lastName)) {
    alert('Last name contains invalid characters')
    return
  }
  if (
    profileForm.value.firstName &&
    profileForm.value.lastName &&
    profileForm.value.firstName.trim().toLowerCase() === profileForm.value.lastName.trim().toLowerCase()
  ) {
    alert('First name and last name must not be the same')
    return
  }

  try {
    const response = await apiClient.put('/auth/profile', {
      email: profileForm.value.email,
      firstName: profileForm.value.firstName,
      lastName: profileForm.value.lastName,
    })
    
    // Update auth store with new user data so navbar reflects the changes
    const updatedUser = {
      ...authStore.user,
      firstName: response.data.data?.first_name,
      lastName: response.data.data?.last_name,
      email: response.data.data?.email,
    }
    authStore.setUser(updatedUser)
    
    alert('Profile updated successfully!')
    isEditingProfile.value = false
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update profile')
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('New passwords do not match!')
    return
  }

  // Password policy: 8-32 chars, at least one uppercase, one lowercase, one special char
  const pwdRegex = /^(?=.{8,32}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/
  if (!pwdRegex.test(passwordForm.value.newPassword)) {
    alert('Password must be 8–32 characters and include uppercase, lowercase and a special character')
    return
  }

  try {
    await apiClient.put('/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    alert('Password changed successfully!')
    resetPasswordForm()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to change password. Please check your current password.')
  }
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const logout = async () => {
  if (window.confirm('Are you sure you want to logout?')) {
    authStore.logout()
    try {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    } catch (e) {}
    alert('You have been logged out successfully')
  }
}

onMounted(fetchUserData)
</script>
