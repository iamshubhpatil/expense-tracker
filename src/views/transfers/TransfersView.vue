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

          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Transfers</h1>
            <button
              @click="showForm = !showForm"
              class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <span>➕ Add Transfer</span>
            </button>
          </div>

          <!-- Form -->
          <div v-if="showForm" class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Account</label>
                  <div class="flex gap-2">
                    <select
                      v-model="formData.fromAccountId"
                      required
                      class="flex-1 h-[44px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Select account</option>
                      <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                        {{ acc.name }}{{ acc.account_type ? ` (${acc.account_type})` : '' }}
                      </option>
                    </select>
                  </div>
                  <p v-if="accounts.length === 0" class="text-xs text-red-500 dark:text-red-400 mt-1">
                    No accounts available. <router-link to="/dashboard" class="underline font-semibold">Create an account in Dashboard</router-link> with an account type.
                  </p>
                  <p v-else-if="!accounts.some(a => a.account_type)" class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    💡 Accounts don't have types assigned. Create new accounts in <router-link to="/dashboard" class="underline font-semibold">Dashboard</router-link> with the account type form.
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Account</label>
                  <div class="flex gap-2">
                    <select
                      v-model="formData.toAccountId"
                      required
                      class="flex-1 h-[44px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Select account</option>
                      <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                        {{ acc.name }}{{ acc.account_type ? ` (${acc.account_type})` : '' }}
                      </option>
                    </select>
                  </div>
                  <p v-if="accounts.length === 0" class="text-xs text-red-500 dark:text-red-400 mt-1">
                    No accounts available. <router-link to="/dashboard" class="underline font-semibold">Create an account in Dashboard</router-link> with an account type.
                  </p>
                  <p v-else-if="!accounts.some(a => a.account_type)" class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    💡 Accounts don't have types assigned. Create new accounts in <router-link to="/dashboard" class="underline font-semibold">Dashboard</router-link> with the account type form.
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input
                    v-model.number="formData.amount"
                    type="number"
                    step="0.01"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & time</label>
                  <input
                    v-model="formData.transferDate"
                    type="datetime-local"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  v-model="formData.description"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                  placeholder="Optional description"
                />
              </div>
              <div class="flex gap-2">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                  {{ editingId ? 'Update Transfer' : 'Add Transfer' }}
                </button>
                <button type="button" @click="resetForm" class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Transfers List -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">From Account</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">To Account</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="transfers.length === 0" class="border-b border-gray-100 dark:border-gray-600">
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No transfers yet</td>
                  </tr>
                  <tr v-for="transfer in transfers" :key="transfer.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ formatDateTime(transfer.transfer_date) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ getAccountName(transfer.from_account_id) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ getAccountName(transfer.to_account_id) }}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{{ formatCurrency(transfer.amount) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ transfer.description }}</td>
                    <td class="px-6 py-4 text-sm space-x-2">
                      <button
                        @click="editTransfer(transfer)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteTransfer(transfer.id)"
                        class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
import apiClient from '@/lib/api'
import { formatCurrency, formatDateTime, toDatetimeLocal, localToISOString } from '@/lib/utils'

const transfers = ref([])
const accounts = ref([])
const showForm = ref(false)
const editingId = ref(null)
const formData = ref({
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  description: '',
  transferDate: toDatetimeLocal(new Date()),
})

const fetchData = async () => {
  try {
    const [transfersRes, accountsRes] = await Promise.all([
      apiClient.get('/transfers'),
      apiClient.get('/accounts'),
    ])
    transfers.value = transfersRes.data.data
    accounts.value = (accountsRes.data.data || []).map(acc => ({
      ...acc,
      displayName: `${acc.name}${acc.account_type ? ` (${acc.account_type})` : ''}`
    }))
  } catch (error) {
    console.error('Failed to load data', error)
  }
}

const handleSubmit = async () => {
  if (formData.value.fromAccountId === formData.value.toAccountId) {
    alert('Cannot transfer to the same account')
    return
  }

  try {
    try {
      const payload = { ...formData.value }
      if (payload.transferDate) payload.date = localToISOString(payload.transferDate)
      if (editingId.value) {
        await apiClient.put(`/transfers/${editingId.value}`, payload)
      } else {
        await apiClient.post('/transfers', payload)
      }
    } catch (err) {
      throw err
    }
    resetForm()
    fetchData()
  } catch (error) {
    console.error('Failed to save transfer', error)
  }
}

const editTransfer = (transfer) => {
  editingId.value = transfer.id
  formData.value = {
    fromAccountId: transfer.from_account_id,
    toAccountId: transfer.to_account_id,
    amount: transfer.amount,
    description: transfer.description,
    transferDate: toDatetimeLocal(transfer.transfer_date),
  }
  showForm.value = true
}

const deleteTransfer = async (id) => {
  if (window.confirm('Are you sure you want to delete this transfer?')) {
    try {
      await apiClient.delete(`/transfers/${id}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete transfer', error)
    }
  }
}

const resetForm = () => {
  editingId.value = null
  formData.value = {
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    transferDate: toDatetimeLocal(new Date()),
  }
  showForm.value = false
}

const getAccountName = (id) => {
  return accounts.value.find(a => a.id === id)?.name || 'Unknown'
}

onMounted(() => {
  fetchData()

  // Auto-refresh accounts when page becomes visible
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchData()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})
</script>
