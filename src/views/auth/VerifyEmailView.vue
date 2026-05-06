<template>
  <div class="max-w-xl mx-auto py-12 px-6">
    <h1 class="text-2xl font-semibold mb-4">Email Verification</h1>

    <div v-if="loading" class="text-gray-600">Verifying your email...</div>

    <div v-else>
      <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded"> 
        <p class="text-green-700">{{ message }}</p>
        <router-link to="/login" class="mt-3 inline-block text-sm text-indigo-600">Sign in</router-link>
      </div>

      <div v-else class="p-4 bg-red-50 border border-red-200 rounded">
        <p class="text-red-700">{{ message }}</p>
        <div class="mt-3">
          <router-link to="/signup" class="inline-block text-sm text-indigo-600">Create an account</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const message = ref('')

onMounted(() => {
  loading.value = false
  const token = route.query.token
  if (token) {
    success.value = true
    message.value = 'Your email has been verified successfully. You can now sign in.'
  } else {
    success.value = true
    message.value = 'If you were redirected here from your email, your account verification was completed.'
  }
})
</script>

<style scoped>
</style>
