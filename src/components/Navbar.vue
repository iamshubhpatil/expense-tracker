<template>
  <div class="bg-white dark:bg-gray-800 shadow px-6 py-4 flex items-center justify-between">
    <div>
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Personal Expense Tracker</h2>
    </div>
    <div class="flex items-center space-x-4">
      <BudgetAlerts />
      <button
        @click="toggleDarkMode"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title="Toggle dark mode"
      >
        <span v-if="isDark" class="text-2xl">☀️</span>
        <span v-else class="text-2xl">🌙</span>
      </button>
      <div class="text-right">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-400">{{ authStore.user?.email }}</p>
      </div>
      <button
        @click="logout"
        class="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
      >
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BudgetAlerts from '@/components/BudgetAlerts.vue'

const router = useRouter()
const authStore = useAuthStore()
const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const logout = () => {
  authStore.logout()
  alert('You have been logged out successfully')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDark.value = savedTheme === 'dark'
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>
