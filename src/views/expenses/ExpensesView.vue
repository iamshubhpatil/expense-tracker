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
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
            <button
              @click="showForm = !showForm"
              class="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <span>➕ Add Expense</span>
            </button>
          </div>

          <!-- Form -->
          <div v-if="showForm" class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <div class="flex gap-2">
                    <select
                      v-model="formData.categoryId"
                      required
                      class="flex-1 h-[44px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Select category</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.icon || '' }} {{ cat.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory (optional)
                  </label>
                  <div class="flex gap-2">
                    <select
                      v-model="formData.subcategoryId"
                      class="flex-1 h-[44px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">No subcategory</option>
                      <option v-for="s in subcategories" :key="s.id" :value="s.id">
                        {{ s.icon || '' }} {{ s.name }}
                      </option>
                    </select>
                  </div>
                  <!-- invisible placeholder to match width -->
                  <div class="w-[42px]"></div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                  <div class="flex gap-2">
                    <select
                      v-model="formData.accountId"
                      required
                      class="flex-1 h-[44px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Select account</option>
                      <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                        {{ acc.name }}{{ acc.account_type ? ` (${acc.account_type})` : '' }}
                      </option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input
                    v-model.number="formData.amount"
                    type="number"
                    step="0.01"
                    required
                    class="w-full px-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & time</label>
                  <input
                    v-model="formData.expenseDate"
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
                <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                  {{ editingId ? 'Update Expense' : 'Add Expense' }}
                </button>
                <button type="button" @click="resetForm" class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Expenses List -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Account</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="expenses.length === 0" class="border-b border-gray-100 dark:border-gray-600">
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No expenses yet</td>
                  </tr>
                  <tr v-for="expense in expenses" :key="expense.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ formatDateTime(expense.expense_date) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ getCategoryName(expense.category_id) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ expense.description }}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(expense.amount) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ getAccountName(expense.account_id) }}</td>
                    <td class="px-6 py-4 text-sm space-x-2">
                      <button
                        @click="editExpense(expense)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteExpense(expense.id)"
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
import { ref, onMounted, watch, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
import apiClient from '@/lib/api'
import { formatCurrency, formatDateTime, toDatetimeLocal, localToISOString } from '@/lib/utils'
import { useCategoriesStore } from '@/stores/categories'

const categoriesStore = useCategoriesStore()
const expenses = ref([])
const categoriesHier = computed(() => categoriesStore.expenseCategories)
const categories = computed(() => (categoriesHier.value || []).map((c) => ({ id: c.id, name: c.name, icon: c.icon })))
const subcategories = ref([]) // subcategories for selected parent
const accounts = ref([])
const showForm = ref(false)
const editingId = ref(null)
const formData = ref({
  categoryId: '',
  subcategoryId: '',
  accountId: '',
  amount: '',
  description: '',
  expenseDate: toDatetimeLocal(new Date()),
})

const fetchData = async () => {
  try {
    const [expensesRes, accountsRes] = await Promise.all([
      apiClient.get('/expenses'),
      apiClient.get('/accounts'),
    ])
    expenses.value = expensesRes.data.data
    await categoriesStore.fetchCategories()
    // Enhance accounts with type information if available
    accounts.value = (accountsRes.data.data || []).map(acc => ({
      ...acc,
      displayName: `${acc.name}${acc.account_type ? ` (${acc.account_type})` : ''}`
    }))
    console.log('Accounts fetched:', accounts.value)
  } catch (error) {
    console.error('Failed to load data', error)
  }
}

const handleSubmit = async () => {
  try {
    // choose category: prefer subcategory if provided
    const payload = { ...formData.value }
    payload.categoryId = formData.value.subcategoryId || formData.value.categoryId
    if (payload.expenseDate) payload.date = localToISOString(payload.expenseDate)

    if (editingId.value) {
      await apiClient.put(`/expenses/${editingId.value}`, payload)
    } else {
      await apiClient.post('/expenses', payload)
    }
    resetForm()
    fetchData()
  } catch (error) {
    console.error('Failed to save expense', error)
  }
}

const editExpense = (expense) => {
  editingId.value = expense.id
  // Determine if expense.category_id is a parent or a subcategory
  let parentId = expense.category_id
  let subId = ''
  // search parents and their subcategories
  for (const p of categoriesHier.value || []) {
    if (p.id === expense.category_id) {
      parentId = p.id
      subId = ''
      break
    }
    const found = (p.subcategories || []).find(s => s.id === expense.category_id)
    if (found) {
      parentId = p.id
      subId = found.id
      break
    }
  }

  formData.value = {
    categoryId: parentId,
    subcategoryId: subId,
    accountId: expense.account_id,
    amount: expense.amount,
    description: expense.description,
    expenseDate: toDatetimeLocal(expense.expense_date),
  }
  showForm.value = true
}

const deleteExpense = async (id) => {
  if (window.confirm('Are you sure you want to delete this expense?')) {
    try {
      await apiClient.delete(`/expenses/${id}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete expense', error)
    }
  }
}

const resetForm = () => {
  editingId.value = null
  formData.value = {
    categoryId: '',
    subcategoryId: '',
    accountId: '',
    amount: '',
    description: '',
    expenseDate: toDatetimeLocal(new Date()),
  }
  showForm.value = false
}

// update subcategories when parent category changes
watch(() => formData.value.categoryId, (val) => {
  const parent = (categoriesHier.value || []).find(c => c.id === val)
  subcategories.value = parent ? (parent.subcategories || []) : []
  // clear selected subcategory if it no longer exists
  if (!subcategories.value.find(s => s.id === formData.value.subcategoryId)) {
    formData.value.subcategoryId = ''
  }
})

const getCategoryName = (id) => {
  // search parents
  const parent = (categoriesHier.value || []).find(p => p.id === id)
  if (parent) return `${parent.icon || ''} ${parent.name}`
  // search subcategories
  for (const p of (categoriesHier.value || [])) {
    const sub = (p.subcategories || []).find(s => s.id === id)
    if (sub) return `${p.name} / ${sub.icon || ''} ${sub.name}`
  }
  return 'Unknown'
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
