import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/lib/api'

export const useCategoriesStore = defineStore('categories', () => {
  const expenseCategories = ref([])
  const incomeCategories = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const flatExpenseCategories = computed(() => {
    const flat = []
    for (const cat of expenseCategories.value) {
      flat.push(cat)
      if (cat.subcategories) {
        flat.push(...cat.subcategories)
      }
    }
    return flat
  })

  const flatIncomeCategories = computed(() => {
    const flat = []
    for (const cat of incomeCategories.value) {
      flat.push(cat)
      if (cat.subcategories) {
        flat.push(...cat.subcategories)
      }
    }
    return flat
  })

  const fetchCategories = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const [expRes, incRes] = await Promise.all([
        apiClient.get('/expense-categories/hierarchy'),
        apiClient.get('/income-categories/hierarchy'),
      ])

      if (expRes.data.success) {
        expenseCategories.value = expRes.data.data || []
      }
      if (incRes.data.success) {
        incomeCategories.value = incRes.data.data || []
      }
    } catch (err) {
      console.error('Failed to fetch categories', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const addExpenseCategory = async (payload) => {
    try {
      const response = await apiClient.post('/expense-categories', payload)
      if (response.data.success) {
        await fetchCategories()
        return response.data.data
      }
    } catch (err) {
      console.error('Failed to add expense category', err)
      throw err
    }
  }

  const addIncomeCategory = async (payload) => {
    try {
      const response = await apiClient.post('/income-categories', payload)
      if (response.data.success) {
        await fetchCategories()
        return response.data.data
      }
    } catch (err) {
      console.error('Failed to add income category', err)
      throw err
    }
  }

  const deleteExpenseCategory = async (id) => {
    try {
      const response = await apiClient.delete(`/expense-categories/${id}`)
      if (response.data.success) {
        await fetchCategories()
      }
    } catch (err) {
      console.error('Failed to delete expense category', err)
      throw err
    }
  }

  const deleteIncomeCategory = async (id) => {
    try {
      const response = await apiClient.delete(`/income-categories/${id}`)
      if (response.data.success) {
        await fetchCategories()
      }
    } catch (err) {
      console.error('Failed to delete income category', err)
      throw err
    }
  }

  return {
    expenseCategories,
    incomeCategories,
    flatExpenseCategories,
    flatIncomeCategories,
    isLoading,
    error,
    fetchCategories,
    addExpenseCategory,
    addIncomeCategory,
    deleteExpenseCategory,
    deleteIncomeCategory,
  }
})
