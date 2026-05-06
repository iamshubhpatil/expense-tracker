<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div class="text-center py-20">
          <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
          <p class="text-gray-600 mt-4">Coming soon...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'

defineProps({
  title: {
    type: String,
    default: 'Page'
  }
})
</script>
