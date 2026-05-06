<template>
  <div class="w-64 bg-lavender-50 dark:bg-gray-900 shadow-lg flex flex-col border-r border-lavender-200 dark:border-gray-700">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-2xl font-bold text-lavender-600 dark:text-lavender-400">💰 Tracker</h2>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <router-link
        to="/dashboard"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>📊</span>
        <span>Dashboard</span>
      </router-link>
      <router-link
        to="/expenses"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>💸</span>
        <span>Expenses</span>
      </router-link>
      <router-link
        to="/income"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>💵</span>
        <span>Income</span>
      </router-link>
      <router-link
        to="/transfers"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>↔️</span>
        <span>Transfers</span>
      </router-link>
      <router-link
        to="/reports"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>📈</span>
        <span>Reports</span>
      </router-link>
      <router-link
        to="/budgets"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>💼</span>
        <span>Budgets</span>
      </router-link>
      <router-link
        to="/import"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>📥</span>
        <span>Import</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
      <router-link
        to="/profile"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>👤</span>
        <span>Profile</span>
      </router-link>
      <router-link
        to="/settings"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>⚙️</span>
        <span>Settings</span>
      </router-link>
      <router-link
        v-if="authStore.userRole === 'admin'"
        to="/admin"
        class="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-lavender-50 dark:hover:bg-gray-800 hover:text-lavender-600 dark:hover:text-lavender-400 rounded-lg transition"
        active-class="bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-400"
      >
        <span>🔐</span>
        <span>Admin</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>
