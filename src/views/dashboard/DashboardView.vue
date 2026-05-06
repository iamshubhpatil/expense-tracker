<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p class="text-gray-600 dark:text-gray-400">Welcome back! Here's your financial overview.</p>
            </div>
            <button
              @click="fetchDashboardData"
              :disabled="loading"
              class="flex items-center space-x-2 bg-lavender-600 hover:bg-lavender-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
            >
              <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              icon="📈"
              title="Total Income"
              :value="data.totalIncome"
              color="bg-green-500"
            />
            <StatCard
              icon="📉"
              title="Total Expenses"
              :value="data.totalExpenses"
              color="bg-red-500"
            />
            <StatCard
              icon="💵"
              title="This Month Income"
              :value="data.currentMonthIncome"
              color="bg-lavender-500"
            />
            <StatCard
              icon="🧾"
              title="This Month Expenses"
              :value="data.currentMonthExpenses"
              color="bg-red-500"
            />
            <StatCard
              icon="💳"
              title="Total Balance"
              :value="data.totalBalance"
              color="bg-purple-500"
            />
          </div>

          <!-- Budget Summary -->
          <div v-if="budgetSummary.total_budgets > 0" class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon="💼"
              title="Total Budget"
              :value="Number(budgetSummary.total_budget_amount || 0)"
              color="bg-blue-500"
            />
            <StatCard
              icon="💰"
              title="Total Spent"
              :value="Number(budgetSummary.total_spending || 0)"
              color="bg-green-500"
            />
            <StatCard
              icon="⚠️"
              title="Warnings"
              :value="budgetSummary.warning_count || 0"
              :isCurrency="false"
              color="bg-yellow-500"
            />
            <StatCard
              icon="🚨"
              title="Exceeded"
              :value="budgetSummary.exceeded_count || 0"
              :isCurrency="false"
              color="bg-red-500"
            />
          </div>

          <!-- Budget Alerts -->
          <div v-if="budgetAlerts.length > 0" class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Budget Alerts</h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ budgetAlerts.length }} unread</span>
            </div>
            <div class="space-y-3">
              <div
                v-for="alert in budgetAlerts.slice(0, 5)"
                :key="alert.id"
                class="p-4 rounded-lg border-l-4 transition"
                :class="alert.alert_type === 'EXCEEDED'
                  ? 'bg-red-50 dark:bg-red-900 border-red-500'
                  : 'bg-yellow-50 dark:bg-yellow-900 border-yellow-500'"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ alert.alert_type === 'EXCEEDED' ? '🚨 Budget Exceeded' : '⚠️ Budget Warning' }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {{ alert.category_name }} — {{ Number(alert.percentage_used || 0).toFixed(1) }}% of {{ formatCurrency(alert.budget_amount || 0) }}
                    </p>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(alert.created_at) }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">Spent: {{ formatCurrency(alert.current_spending || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Accounts -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Your Accounts</h2>
              <router-link
                to="/settings"
                class="text-sm text-lavender-600 hover:text-lavender-700 dark:text-lavender-400 dark:hover:text-lavender-300"
              >
                Create Account →
              </router-link>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-if="accounts.length === 0" class="col-span-full text-center py-6 text-gray-500 dark:text-gray-400">
                No accounts yet. Create an account to get started.
              </div>
              <div v-for="account in accounts" :key="account.id" class="p-4 bg-gradient-to-br from-lavender-50 to-lavender-100 dark:from-gray-600 dark:to-gray-700 rounded-lg border border-lavender-200 dark:border-gray-500">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ account.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Account</p>
                  </div>
                  <span v-if="account.account_type" class="text-xs px-2 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                    {{ account.account_type }}
                  </span>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-end">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(account.balance || 0) }}</span>
                  </div>
                  <div v-if="account.currency" class="text-xs text-gray-500 dark:text-gray-400">
                    Currency: {{ account.currency }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="data.recentTransactions.length === 0" class="border-b border-gray-100 dark:border-gray-600">
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No transactions yet</td>
                  </tr>
                  <tr v-for="(txn, idx) in data.recentTransactions" :key="idx" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4">
                      <span
                        :class="{
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200': txn.type === 'income',
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200': txn.type === 'expense',
                          'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200': txn.type === 'transfer'
                        }"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {{ txn.type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ txn.category_icon || '' }} {{ txn.category }}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(txn.amount) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatDateTime(txn.date) }}</td>
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
import StatCard from '@/components/StatCard.vue'
import apiClient from '@/lib/api'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

const loading = ref(false)
const accounts = ref([])
const accountTypes = ref([])
const budgetSummary = ref({})
const budgetAlerts = ref([])
const data = ref({
  totalIncome: 0,
  totalExpenses: 0,
  currentMonthIncome: 0,
  currentMonthExpenses: 0,
  totalBalance: 0,
  recentTransactions: [],
})

const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/accounts')
    accounts.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load accounts', error)
  }
}

const loadAccountTypes = () => {
  try {
    const saved = localStorage.getItem('accountCategories')
    if (saved) {
      accountTypes.value = JSON.parse(saved)
    } else {
      // Default types if nothing saved
      accountTypes.value = ['Cash', 'Savings Account', 'Credit Card', 'Debit Card']
    }
  } catch (error) {
    console.error('Failed to load account types', error)
    accountTypes.value = ['Cash', 'Savings Account', 'Credit Card', 'Debit Card']
  }
}

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const [reportResponse, accountsData, budgetData, alertsData] = await Promise.all([
      apiClient.get('/reports/overview'),
      apiClient.get('/accounts').catch(() => ({ data: { success: false, data: [] } })),
      apiClient.get('/budgets/summary').catch(() => ({ data: { success: false, data: {} } })),
      apiClient.get('/budgets/alerts/list?isRead=false').catch(() => ({ data: { success: false, data: [] } })),
    ])
    data.value = reportResponse.data.data || data.value
    accounts.value = accountsData.data?.data || []
    budgetSummary.value = budgetData.data?.data || {}
    budgetAlerts.value = alertsData.data?.data || []
    console.log('Dashboard data:', { data: data.value, accounts: accounts.value, budgetSummary: budgetSummary.value, budgetAlerts: budgetAlerts.value })
  } catch (error) {
    console.error('Failed to load dashboard data', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAccountTypes()
  fetchDashboardData()

  // Refetch when page becomes visible
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchDashboardData()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})
</script>
