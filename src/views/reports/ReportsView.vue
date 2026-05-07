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
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Financial Reports</h1>
          </div>

          <!-- Report Type Buttons -->
          <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
            <button
              @click="setReportType('daily')"
              :class="['px-4 py-2 rounded-lg font-medium transition', reportType === 'daily' ? 'bg-lavender-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600']"
            >
              Daily
            </button>
            <button
              @click="setReportType('weekly')"
              :class="['px-4 py-2 rounded-lg font-medium transition', reportType === 'weekly' ? 'bg-lavender-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600']"
            >
              Weekly
            </button>
            <button
              @click="setReportType('monthly')"
              :class="['px-4 py-2 rounded-lg font-medium transition', reportType === 'monthly' ? 'bg-lavender-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600']"
            >
              Monthly
            </button>
            <button
              @click="setReportType('quarterly')"
              :class="['px-4 py-2 rounded-lg font-medium transition', reportType === 'quarterly' ? 'bg-lavender-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600']"
            >
              Quarterly
            </button>
            <button
              @click="setReportType('yearly')"
              :class="['px-4 py-2 rounded-lg font-medium transition', reportType === 'yearly' ? 'bg-lavender-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600']"
            >
              Yearly
            </button>
            <button
              @click="setReportType('custom')"
              :class="['px-4 py-2 rounded-lg font-medium transition', reportType === 'custom' ? 'bg-lavender-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600']"
            >
              Custom
            </button>
          </div>

          <!-- Report Filters -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start</label>
                <input
                  v-model="filters.startDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End</label>
                <input
                  v-model="filters.endDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
                <select
                  v-model="filters.type"
                  class="w-full h-[46px] px-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                >
                  <option value="all">All Reports</option>
                  <option value="expenses">Expenses Only</option>
                  <option value="income">Income Only</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button
                @click="generateReports"
                :disabled="loading"
                class="px-6 py-2 bg-lavender-600 hover:bg-lavender-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Generate Report</span>
              </button>
              <button
                @click="exportData"
                :disabled="loading"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                <span>📥 Export Data</span>
              </button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Income</h3>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(summary.totalIncome) }}</p>
            </div>
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Expenses</h3>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(summary.totalExpenses) }}</p>
            </div>
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Net Balance</h3>
              <p :class="['text-2xl font-bold', summary.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400']">
                {{ formatCurrency(summary.netBalance) }}
              </p>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Expenses Pie Chart -->
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Expenses by Category</h2>
              <div v-if="expensesByCategory.length === 0" class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No expense data available
              </div>
              <div v-else class="h-64">
                <canvas id="expensesChart"></canvas>
              </div>
              <!-- Fallback list view -->
              <div class="mt-4 space-y-2 text-sm">
                <div v-for="category in expensesByCategory" :key="category.id" class="flex justify-between">
                  <span class="text-gray-700 dark:text-gray-300">{{ category.name }}</span>
                  <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(category.total) }} ({{ (category.percentage || 0).toFixed(1) }}%)</span>
                </div>
              </div>
            </div>

            <!-- Income Pie Chart -->
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Income by Category</h2>
              <div v-if="incomeByCategory.length === 0" class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No income data available
              </div>
              <div v-else class="h-64">
                <canvas id="incomeChart"></canvas>
              </div>
              <!-- Fallback list view -->
              <div class="mt-4 space-y-2 text-sm">
                <div v-for="category in incomeByCategory" :key="category.id" class="flex justify-between">
                  <span class="text-gray-700 dark:text-gray-300">{{ category.name }}</span>
                  <span class="font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(category.total) }} ({{ (category.percentage || 0).toFixed(1) }}%)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Budget Comparison Chart -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Budget Comparison by Category</h2>
            <div v-if="budgetComparison.length === 0" class="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No budget comparison data available
            </div>
            <div v-else class="h-80">
              <canvas id="budgetComparisonChart"></canvas>
            </div>

            <div v-if="budgetComparison.length > 0" class="mt-4 space-y-3 text-sm">
              <div v-for="item in budgetComparison" :key="item.id" class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ item.category }}</p>
                  <p class="text-gray-500 dark:text-gray-400 text-xs">{{ item.month }}</p>
                </div>
                <div class="text-right">
                  <p :class="item.status === 'EXCEEDED' ? 'text-red-600 dark:text-red-400' : item.status === 'NEAR_LIMIT' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'">
                    {{ item.status === 'EXCEEDED' ? 'Exceeded' : item.status === 'NEAR_LIMIT' ? 'Near limit' : 'Under budget' }}
                  </p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.spent) }} / {{ formatCurrency(item.budget) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Trend Chart -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Monthly Trend</h2>
            <div v-if="monthlyTrend.length === 0" class="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
            <div v-else class="h-80">
              <canvas id="trendChart"></canvas>
            </div>
            <!-- Fallback table view -->
            <div v-if="monthlyTrend.length > 0" class="mt-6 overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th class="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Month</th>
                    <th class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold">Income</th>
                    <th class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold">Expenses</th>
                    <th class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold">Net</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="month in monthlyTrend" :key="month.month" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-4 py-3 text-gray-900 dark:text-white">{{ month.month }}</td>
                    <td class="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">{{ formatCurrency(month.income) }}</td>
                    <td class="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">{{ formatCurrency(month.expenses) }}</td>
                    <td :class="['px-4 py-3 text-right font-semibold', month.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400']">
                      {{ formatCurrency(month.net) }}
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
import { formatCurrency, localToISOString, toDatetimeLocal } from '@/lib/utils'
import Chart from 'chart.js/auto'

const reportType = ref('monthly')
const loading = ref(false)
let expensesChartInstance = null
let incomeChartInstance = null
let trendChartInstance = null
let budgetChartInstance = null

const filters = ref({
  startDate: '',
  endDate: '',
  type: 'all',
})

const summary = ref({
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
})

const expensesByCategory = ref([])
const incomeByCategory = ref([])
const budgetComparison = ref([])
const monthlyTrend = ref([])

function getDateRange(type) {
  const today = new Date()
  let startDate = new Date()

  switch (type) {
    case 'daily':
      startDate = new Date(today)
      break
    case 'weekly': {
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      startDate = new Date(today.setDate(diff))
      break
    }
    case 'monthly':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    case 'quarterly': {
      const quarter = Math.floor(today.getMonth() / 3)
      startDate = new Date(today.getFullYear(), quarter * 3, 1)
      break
    }
    case 'yearly':
      startDate = new Date(today.getFullYear(), 0, 1)
      break
    default:
      return { startDate: filters.value.startDate, endDate: filters.value.endDate }
  }

  return {
    startDate: toDatetimeLocal(startDate),
    endDate: toDatetimeLocal(new Date()),
  }
}

const getPeriodLabel = (dateValue) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  const options = reportType.value === 'daily'
    ? { month: 'short', day: '2-digit', year: 'numeric' }
    : { month: 'short', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const setReportType = (type) => {
  reportType.value = type
  if (type !== 'custom') {
    const range = getDateRange(type)
    filters.value.startDate = range.startDate
    filters.value.endDate = range.endDate
  }
  generateReports()
}

const generateReports = async () => {
  try {
    loading.value = true

    // Fetch data from multiple endpoints
    const [categoriesRes, budgetRes, incomeChartRes, expenseChartRes] = await Promise.all([
      apiClient
        .get('/reports/categories', {
          params: {
            startDate: localToISOString(filters.value.startDate),
            endDate: localToISOString(filters.value.endDate),
            type: filters.value.type,
          },
        })
        .catch(() => ({ data: { data: [] } })),
      apiClient
        .get('/reports/budgets/comparison', {
          params: {
            startDate: localToISOString(filters.value.startDate),
            endDate: localToISOString(filters.value.endDate),
          },
        })
        .catch(() => ({ data: { data: [] } })),
      apiClient
        .get('/reports/charts/income', {
          params: {
            startDate: localToISOString(filters.value.startDate),
            endDate: localToISOString(filters.value.endDate),
            period: 'monthly',
            type: 'income',
          },
        })
        .catch(() => ({ data: { data: [] } })),
      apiClient
        .get('/reports/charts/expenses', {
          params: {
            startDate: localToISOString(filters.value.startDate),
            endDate: localToISOString(filters.value.endDate),
            period: 'monthly',
            type: 'expense',
          },
        })
        .catch(() => ({ data: { data: [] } })),
    ])

    // Process category data
    let categories = categoriesRes.data.data || []
    if (filters.value.type === 'expenses') {
      categories = categories.filter((cat) => cat.type === 'expense')
    } else if (filters.value.type === 'income') {
      categories = categories.filter((cat) => cat.type === 'income')
    }

    let totalIncome = categoriesRes.data.totalIncome || 0
    let totalExpenses = categoriesRes.data.totalExpenses || 0

    if (filters.value.type === 'expenses') {
      totalIncome = 0
    } else if (filters.value.type === 'income') {
      totalExpenses = 0
    }

    // Separate and process expenses by category
    const expenses = categories.filter((cat) => cat.type === 'expense')
    const totalExp = totalExpenses

    expensesByCategory.value = expenses
      .map((cat) => {
        const catTotal = typeof cat.total === 'string' ? parseFloat(cat.total) : cat.total || 0
        return {
          id: cat.id,
          name: cat.name,
          total: catTotal,
          percentage: totalExp > 0 ? (catTotal / totalExp) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)

    // Separate and process income by category
    const incomes = categories.filter((cat) => cat.type === 'income')
    const totalInc = totalIncome

    incomeByCategory.value = incomes
      .map((cat) => {
        const catTotal = typeof cat.total === 'string' ? parseFloat(cat.total) : cat.total || 0
        return {
          id: cat.id,
          name: cat.name,
          total: catTotal,
          percentage: totalInc > 0 ? (catTotal / totalInc) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)

    // totalExpenses and totalIncome already set above

    // Process budget comparison data
    const budgetData = budgetRes.data.data || []
    budgetComparison.value = budgetData
      .map((item) => {
        const spent = typeof item.spent === 'string' ? parseFloat(item.spent) : item.spent || 0
        const budget = typeof item.budget_amount === 'string' ? parseFloat(item.budget_amount) : item.budget_amount || 0
        return {
          id: item.id,
          category: item.category_name,
          month: getPeriodLabel(item.month),
          budget,
          spent,
          variance: typeof item.variance === 'string' ? parseFloat(item.variance) : item.variance || 0,
          status: item.status || 'UNDER',
        }
      })
      .sort((a, b) => new Date(b.month) - new Date(a.month) || a.category.localeCompare(b.category))

    // Update summary
    summary.value = {
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      netBalance: totalIncome - totalExpenses,
    }

    // Build monthly trend from income and expense chart data
    const incomeChart = incomeChartRes.data.data || []
    const expenseChart = expenseChartRes.data.data || []

    // Create a map of periods to collect data
    const monthMap = new Map()

    incomeChart.forEach((item) => {
      const periodLabel = getPeriodLabel(item.date || item.month)
      if (!monthMap.has(periodLabel)) {
        monthMap.set(periodLabel, { month: periodLabel, income: 0, expenses: 0 })
      }
      const monthData = monthMap.get(periodLabel)
      monthData.income = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount || 0
    })

    expenseChart.forEach((item) => {
      const periodLabel = getPeriodLabel(item.date || item.month)
      if (!monthMap.has(periodLabel)) {
        monthMap.set(periodLabel, { month: periodLabel, income: 0, expenses: 0 })
      }
      const monthData = monthMap.get(periodLabel)
      monthData.expenses = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount || 0
    })

    monthlyTrend.value = Array.from(monthMap.values())
      .map((month) => ({
        month: month.month,
        income: month.income,
        expenses: month.expenses,
        net: month.income - month.expenses,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))

    // Render charts
    renderCharts()
  } catch (error) {
    console.error('Failed to generate reports', error)
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  // Helper function to get theme-aware colors
  const getThemeColors = () => {
    const isDark = document.documentElement.classList.contains('dark')
    return {
      textColor: isDark ? '#e5e7eb' : '#374151',
      borderColor: isDark ? '#374151' : '#ffffff',
      hoverBorderColor: isDark ? '#4b5563' : '#ffffff',
      centerTextColor: isDark ? '#e5e7eb' : '#374151',
    }
  }
  
  setTimeout(() => {
    const doughnutSegmentLabelsPlugin = {
      id: 'doughnutSegmentLabels',
      afterDatasetDraw(chart, args, options) {
        const dataset = chart.data.datasets[0]
        const meta = chart.getDatasetMeta(0)
        const total = dataset.data.reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0)

        meta.data.forEach((arc, index) => {
          const value = dataset.data[index]
          if (!value || total === 0) return

          const percentage = Math.round((value / total) * 100)
          const midAngle = (arc.startAngle + arc.endAngle) / 2
          const radius = (arc.innerRadius + arc.outerRadius) / 2
          const x = arc.x + Math.cos(midAngle) * radius
          const y = arc.y + Math.sin(midAngle) * radius

          chart.ctx.save()
          chart.ctx.fillStyle = options.color || '#374151'
          chart.ctx.font = `${options.fontWeight || ''} ${options.fontSize}px ${options.fontFamily}`
          chart.ctx.textAlign = 'center'
          chart.ctx.textBaseline = 'middle'
          chart.ctx.fillText(`${percentage}%`, x, y)
          chart.ctx.restore()
        })
      }
    }

    const barValueLabelsPlugin = {
      id: 'barValueLabels',
      afterDatasetsDraw(chart, args, options) {
        const ctx = chart.ctx
        const yAxis = chart.scales.y
        const zeroPixel = yAxis.getPixelForValue(0)

        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex)
          meta.data.forEach((bar, index) => {
            const rawValue = dataset.data[index]
            const value = Number(rawValue)
            if (Number.isNaN(value) || value === 0) return

            const label = typeof options.formatter === 'function'
              ? options.formatter(value, dataset, datasetIndex, index)
              : formatCurrency(value)

            ctx.save()
            ctx.fillStyle = options.color || '#374151'
            ctx.font = `${options.fontWeight || '600'} ${options.fontSize}px ${options.fontFamily}`
            ctx.textAlign = 'center'

            const x = bar.x
            const chartArea = chart.chartArea || {}
            const topLimit = chartArea.top != null ? chartArea.top + 4 : 0
            const bottomLimit = chartArea.bottom != null ? chartArea.bottom - 4 : Infinity
            const fontHeight = options.fontSize || 12
            let y

            if (value < 0) {
              y = bar.y + options.offsetBelow
              ctx.textBaseline = 'top'
              if (y + fontHeight > bottomLimit) {
                y = bottomLimit - fontHeight
              }
            } else {
              const proposedY = bar.y + options.offsetAbove
              if (proposedY < topLimit + fontHeight) {
                y = topLimit + fontHeight
              } else {
                y = proposedY
              }
              ctx.textBaseline = 'bottom'
            }

            ctx.fillText(label, x, y)
            ctx.restore()
          })
        })
      }
    }

    // Render expenses pie chart
    const expensesCtx = document.getElementById('expensesChart')
    if (expensesCtx && expensesByCategory.value.length > 0) {
      if (expensesChartInstance) expensesChartInstance.destroy()
      
      // Create gradient backgrounds with more sophisticated colors
      const ctx = expensesCtx.getContext('2d')
      const expenseGradients = expensesByCategory.value.map((_, index) => {
        const gradient = ctx.createRadialGradient(150, 150, 50, 150, 150, 150)
        const colors = [
          ['#ef4444', '#dc2626', '#b91c1c'], // red gradient
          ['#f97316', '#ea580c', '#c2410c'], // orange gradient
          ['#f59e0b', '#d97706', '#b45309'], // amber gradient
          ['#eab308', '#ca8a04', '#a16207'], // yellow gradient
          ['#84cc16', '#65a30d', '#4d7c0f'], // lime gradient
          ['#22c55e', '#16a34a', '#15803d'], // green gradient
          ['#10b981', '#059669', '#047857'], // emerald gradient
          ['#14b8a6', '#0d9488', '#0f766e'], // teal gradient
        ]
        const [start, mid, end] = colors[index % colors.length]
        gradient.addColorStop(0, start)
        gradient.addColorStop(0.5, mid)
        gradient.addColorStop(1, end)
        return gradient
      })
      
      // Calculate total for center text
      const totalExpenses = expensesByCategory.value.reduce((sum, cat) => sum + cat.total, 0)
      const themeColors = getThemeColors()
      
      expensesChartInstance = new Chart(expensesCtx, {
        type: 'doughnut',
        data: {
          labels: expensesByCategory.value.map((c) => c.name),
          datasets: [
            {
              data: expensesByCategory.value.map((c) => c.total),
              backgroundColor: expenseGradients,
              borderColor: themeColors.borderColor,
              borderWidth: 4,
              hoverBorderWidth: 6,
              hoverBorderColor: themeColors.hoverBorderColor,
              hoverOffset: 8,
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                color: themeColors.textColor,
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                  size: 13,
                  weight: '500',
                },
                generateLabels: function(chart) {
                  const data = chart.data
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i]
                      const percentage = ((value / totalExpenses) * 100).toFixed(1)
                      return {
                        text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: themeColors.borderColor,
                        lineWidth: data.datasets[0].borderWidth,
                        hidden: false,
                        index: i,
                        fontColor: themeColors.textColor,
                        color: themeColors.textColor
                      }
                    })
                  }
                  return []
                }
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#fff',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const percentage = ((value / totalExpenses) * 100).toFixed(1)
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`
                },
              },
            },
            segmentLabel: {
              color: themeColors.textColor,
              fontSize: 12,
              fontFamily: 'Arial',
            },
            // Add center text plugin
            centerText: {
              display: true,
              text: `Total\n${formatCurrency(totalExpenses)}`,
              color: themeColors.centerTextColor,
              fontStyle: 'bold',
              sidePadding: 20,
              minFontSize: 14,
              maxFontSize: 18,
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: 'easeInOutQuart',
          },
          onHover: (event, activeElements) => {
            event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
          },
        },
        plugins: [doughnutSegmentLabelsPlugin, {
          id: 'centerText',
          beforeDraw: function(chart) {
            if (chart.config.options.plugins.centerText.display) {
              const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart
              ctx.save()
              
              const centerX = (left + right) / 2
              const centerY = (top + bottom) / 2
              
              const text = chart.config.options.plugins.centerText.text.split('\n')
              const fontSize = Math.min(chart.config.options.plugins.centerText.maxFontSize, 
                                       Math.max(chart.config.options.plugins.centerText.minFontSize, 
                                               Math.floor(height / 8)))
              
              ctx.font = `${chart.config.options.plugins.centerText.fontStyle} ${fontSize}px Arial`
              ctx.fillStyle = chart.config.options.plugins.centerText.color
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              
              text.forEach((line, index) => {
                ctx.fillText(line, centerX, centerY + (index - (text.length - 1) / 2) * fontSize * 1.2)
              })
              
              ctx.restore()
            }
          }
        }]
      })
    }
    // Render income pie chart
    const incomeCtx = document.getElementById('incomeChart')
    if (incomeCtx && incomeByCategory.value.length > 0) {
      if (incomeChartInstance) incomeChartInstance.destroy()
      
      // Create gradient backgrounds with sophisticated colors
      const ctx = incomeCtx.getContext('2d')
      const incomeGradients = incomeByCategory.value.map((_, index) => {
        const gradient = ctx.createRadialGradient(150, 150, 50, 150, 150, 150)
        const colors = [
          ['#10b981', '#059669', '#047857'], // emerald gradient
          ['#059669', '#047857', '#065f46'], // emerald darker gradient
          ['#047857', '#065f46', '#064e3b'], // emerald darkest gradient
          ['#065f46', '#064e3b', '#042f2e'], // emerald very dark gradient
          ['#0ea5e9', '#0284c7', '#0369a1'], // sky blue gradient
          ['#0284c7', '#0369a1', '#075985'], // sky blue darker gradient
          ['#3b82f6', '#2563eb', '#1d4ed8'], // blue gradient
          ['#2563eb', '#1d4ed8', '#1e40af'], // blue darker gradient
        ]
        const [start, mid, end] = colors[index % colors.length]
        gradient.addColorStop(0, start)
        gradient.addColorStop(0.5, mid)
        gradient.addColorStop(1, end)
        return gradient
      })
      
      // Calculate total for center text
      const totalIncome = incomeByCategory.value.reduce((sum, cat) => sum + cat.total, 0)
      const themeColors = getThemeColors()
      
      incomeChartInstance = new Chart(incomeCtx, {
        type: 'doughnut',
        data: {
          labels: incomeByCategory.value.map((c) => c.name),
          datasets: [
            {
              data: incomeByCategory.value.map((c) => c.total),
              backgroundColor: incomeGradients,
              borderColor: themeColors.borderColor,
              borderWidth: 4,
              hoverBorderWidth: 6,
              hoverBorderColor: themeColors.hoverBorderColor,
              hoverOffset: 8,
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                color: themeColors.textColor,
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                  size: 13,
                  weight: '500',
                },
                generateLabels: function(chart) {
                  const data = chart.data
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i]
                      const percentage = ((value / totalIncome) * 100).toFixed(1)
                      return {
                        text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: themeColors.borderColor,
                        lineWidth: data.datasets[0].borderWidth,
                        hidden: false,
                        index: i,
                        fontColor: themeColors.textColor,
                        color: themeColors.textColor
                      }
                    })
                  }
                  return []
                }
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#fff',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const percentage = ((value / totalIncome) * 100).toFixed(1)
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`
                },
              },
            },
            segmentLabel: {
              color: themeColors.textColor,
              fontSize: 12,
              fontFamily: 'Arial',
            },
            // Add center text plugin
            centerText: {
              display: true,
              text: `Total\n${formatCurrency(totalIncome)}`,
              color: themeColors.centerTextColor,
              fontStyle: 'bold',
              sidePadding: 20,
              minFontSize: 14,
              maxFontSize: 18,
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: 'easeInOutQuart',
          },
          onHover: (event, activeElements) => {
            event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
          },
        },
        plugins: [doughnutSegmentLabelsPlugin, {
          id: 'centerText',
          beforeDraw: function(chart) {
            if (chart.config.options.plugins.centerText.display) {
              const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart
              ctx.save()
              
              const centerX = (left + right) / 2
              const centerY = (top + bottom) / 2
              
              const text = chart.config.options.plugins.centerText.text.split('\n')
              const fontSize = Math.min(chart.config.options.plugins.centerText.maxFontSize, 
                                       Math.max(chart.config.options.plugins.centerText.minFontSize, 
                                               Math.floor(height / 8)))
              
              ctx.font = `${chart.config.options.plugins.centerText.fontStyle} ${fontSize}px Arial`
              ctx.fillStyle = chart.config.options.plugins.centerText.color
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              
              text.forEach((line, index) => {
                ctx.fillText(line, centerX, centerY + (index - (text.length - 1) / 2) * fontSize * 1.2)
              })
              
              ctx.restore()
            }
          }
        }]
      })
    }

    // Render budget comparison bar chart
    const budgetCtx = document.getElementById('budgetComparisonChart')
    if (budgetCtx && budgetComparison.value.length > 0) {
      if (budgetChartInstance) budgetChartInstance.destroy()
      const themeColors = getThemeColors()
      budgetChartInstance = new Chart(budgetCtx, {
        type: 'bar',
        data: {
          labels: budgetComparison.value.map((item) => `${item.category}\n(${item.month})`),
          datasets: [
            {
              label: 'Budget Amount',
              data: budgetComparison.value.map((item) => item.budget),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: '#3b82f6',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Spent',
              data: budgetComparison.value.map((item) => item.spent),
              backgroundColor: budgetComparison.value.map((item) => {
                const percentage = item.budget > 0 ? (item.spent / item.budget) * 100 : 0
                if (percentage > 100) return 'rgba(239, 68, 68, 0.8)' // red for over budget
                if (percentage > 80) return 'rgba(245, 158, 11, 0.8)' // amber for near limit
                return 'rgba(34, 197, 94, 0.8)' // green for under budget
              }),
              borderColor: budgetComparison.value.map((item) => {
                const percentage = item.budget > 0 ? (item.spent / item.budget) * 100 : 0
                if (percentage > 100) return '#ef4444'
                if (percentage > 80) return '#f59e0b'
                return '#22c55e'
              }),
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              align: 'center',
              labels: {
                color: themeColors.textColor,
                usePointStyle: true,
                padding: 12,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#fff',
              borderWidth: 1,
              callbacks: {
                afterLabel: function(context) {
                  const item = budgetComparison.value[context.dataIndex]
                  const percentage = item.budget > 0 ? ((item.spent / item.budget) * 100).toFixed(1) : 0
                  return `Usage: ${percentage}%`
                },
              },
            },
            barValueLabels: {
              color: themeColors.textColor,
              fontSize: 12,
              fontFamily: 'Arial',
              fontWeight: '600',
              offsetAbove: -12,
              offsetBelow: 18,
              formatter: function(value, dataset, datasetIndex, dataIndex) {
                const item = budgetComparison.value[dataIndex]
                if (dataset.label === 'Spent') {
                  const percentage = item.budget > 0 ? ((item.spent / item.budget) * 100).toFixed(0) : '0'
                  return `${formatCurrency(value)} (${percentage}%)`
                }
                return formatCurrency(value)
              }
            },
          },
          scales: {
            x: {
              offset: true,
              ticks: {
                color: themeColors.textColor,
                maxRotation: 0,
                minRotation: 0,
                padding: 12,
              },
              grid: {
                color: themeColors.textColor === '#e5e7eb' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            },
            y: {
              beginAtZero: true,
              grace: '10%',
              ticks: {
                color: themeColors.textColor,
                callback: function(value) {
                  return formatCurrency(value);
                },
              },
              grid: {
                color: themeColors.textColor === '#e5e7eb' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          animation: {
            duration: 1200,
            easing: 'easeInOutQuart',
          },
        },
        plugins: [barValueLabelsPlugin]
      })
    }

    // Render trend bar chart
    const trendCtx = document.getElementById('trendChart')
    if (trendCtx && monthlyTrend.value.length > 0) {
      if (trendChartInstance) trendChartInstance.destroy()
      const themeColors = getThemeColors()
      trendChartInstance = new Chart(trendCtx, {
        type: 'bar',
        data: {
          labels: monthlyTrend.value.map((m) => m.month),
          datasets: [
            {
              label: 'Income',
              data: monthlyTrend.value.map((m) => m.income),
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: '#10b981',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Expenses',
              data: monthlyTrend.value.map((m) => m.expenses),
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: '#ef4444',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              align: 'center',
              labels: {
                color: themeColors.textColor,
                usePointStyle: true,
                padding: 12,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#fff',
              borderWidth: 1,
            },
            barValueLabels: {
              color: themeColors.textColor,
              fontSize: 12,
              fontFamily: 'Arial',
              fontWeight: '600',
              offsetAbove: -12,
              offsetBelow: 18,
              formatter: function(value) {
                return formatCurrency(value)
              }
            },
          },
          scales: {
            x: {
              offset: true,
              ticks: {
                color: themeColors.textColor,
                padding: 12,
              },
              grid: {
                color: themeColors.textColor === '#e5e7eb' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            },
            y: {
              beginAtZero: true,
              grace: '10%',
              ticks: {
                color: themeColors.textColor,
                callback: function(value) {
                  return formatCurrency(value);
                },
              },
              grid: {
                color: themeColors.textColor === '#e5e7eb' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
          },
        },
        plugins: [barValueLabelsPlugin]
      })
    }
  }, 100)
}

const exportData = async () => {
  try {
    const response = await apiClient.get('/reports/export/csv', {
      params: {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        type: filters.value.type,
      },
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
  } catch (error) {
    alert('Failed to export data. Make sure there is data to export.')
    console.error('Export error:', error)
  }
}

onMounted(() => {
  // Initialize with monthly
  const range = getDateRange('monthly')
  filters.value.startDate = range.startDate
  filters.value.endDate = range.endDate
  generateReports()

  // Watch for theme changes and re-render charts
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // Theme has changed, re-render charts
        setTimeout(() => {
          renderCharts()
        }, 100)
      }
    })
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>
