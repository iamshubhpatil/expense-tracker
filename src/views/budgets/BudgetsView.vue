<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
        <div class="space-y-6">
          <!-- Header with Actions -->
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
              <p class="text-gray-600 dark:text-gray-400">Set and monitor your monthly budgets</p>
            </div>
            <button
              @click="showCreateModal = true"
              class="bg-lavender-600 hover:bg-lavender-700 text-white px-4 py-2 rounded-lg transition flex items-center space-x-2"
            >
              <span>+</span>
              <span>Create Budget</span>
            </button>
          </div>

          <!-- Budget Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon="📊"
              title="Total Budget"
              :value="displayBudgetSummary.total_budget_amount || 0"
              color="bg-blue-500"
            />
            <StatCard
              icon="💰"
              title="Total Spent"
              :value="displayBudgetSummary.total_spending || 0"
              color="bg-green-500"
            />
            <StatCard
              icon="⚠️"
              title="Warnings"
              :value="displayBudgetSummary.warning_count || 0"
              :isCurrency="false"
              color="bg-yellow-500"
            />
            <StatCard
              icon="🚨"
              title="Exceeded"
              :value="displayBudgetSummary.exceeded_count || 0"
              :isCurrency="false"
              color="bg-red-500"
            />
          </div>

          <!-- Budget Alerts Section -->
          <div v-if="unreadAlerts && unreadAlerts.length > 0" class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Alerts</h2>
              <button
                @click="markAllAlertsRead"
                class="text-sm text-lavender-600 hover:text-lavender-700 dark:text-lavender-400"
              >
                Mark all as read
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="alert in unreadAlerts.slice(0, 5)"
                :key="alert.id"
                :class="[
                  'p-4 rounded-lg border-l-4 cursor-pointer transition',
                  alert.alert_type === 'EXCEEDED'
                    ? 'bg-red-50 dark:bg-red-900 border-red-500'
                    : 'bg-yellow-50 dark:bg-yellow-900 border-yellow-500'
                ]"
                @click="markAlertRead(alert.id)"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ alert.alert_type === 'EXCEEDED' ? '🚨 Budget Exceeded' : '⚠️ Budget Warning' }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {{ alert.category_name }}: {{ Number(alert.percentage_used || 0).toFixed(1) }}% of {{ formatCurrency(alert.budget_amount || 0) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Spent: {{ formatCurrency(alert.current_spending || 0) }}
                    </p>
                  </div>
                  <span class="text-xs text-gray-500">{{ formatDate(alert.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Budgets List -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ selectedMonth ? `Budgets - ${new Date(selectedMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : 'Current Month Budgets' }}
              </h2>
            </div>
            
            <div v-if="budgets && budgets.length === 0" class="p-6 text-center">
              <p class="text-gray-500 dark:text-gray-400">No budgets created yet. Create one to get started!</p>
            </div>
            
            <div v-else class="divide-y divide-gray-200 dark:divide-gray-600">
              <div
                v-for="budget in budgets"
                :key="budget.id"
                class="p-6 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center space-x-3">
                    <div
                      :style="{ backgroundColor: budget.color || '#9f7aea' }"
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                    >
                      {{ budget.icon || '💰' }}
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ budget.category_name }}</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        Budget: {{ formatCurrency(budget.budget_amount || 0) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="editBudget(budget)"
                      class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteBudgetConfirm(budget)"
                      class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600 dark:text-gray-300">
                      {{ formatCurrency(budget.current_spending || 0) }} spent
                    </span>
                    <span
                      :class="[
                        'text-sm font-semibold',
                        (budget.percentage_used || 0) > 100
                          ? 'text-red-600 dark:text-red-400'
                          : (budget.percentage_used || 0) > 80
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      ]"
                    >
                      {{ Number(budget.percentage_used || 0).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      :style="{ width: Math.min(budget.percentage_used || 0, 100) + '%' }"
                      :class="[
                        'h-2 rounded-full transition-all',
                        (budget.percentage_used || 0) > 100
                          ? 'bg-red-500'
                          : (budget.percentage_used || 0) > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      ]"
                    ></div>
                  </div>
                </div>

                <!-- Budget Details -->
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Remaining</p>
                    <p
                      :class="[
                        'font-semibold',
                        (budget.budget_amount || 0) - (budget.current_spending || 0) < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      ]"
                    >
                      {{ formatCurrency(Math.max(0, (budget.budget_amount || 0) - (budget.current_spending || 0))) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Alert Threshold</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ budget.alert_threshold || 80 }}%</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Status</p>
                    <p
                      :class="[
                        'font-semibold',
                        (budget.percentage_used || 0) > 100
                          ? 'text-red-600 dark:text-red-400'
                          : (budget.percentage_used || 0) > (budget.alert_threshold || 80)
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      ]"
                    >
                      {{ (budget.percentage_used || 0) > 100 ? 'Exceeded' : (budget.percentage_used || 0) > (budget.alert_threshold || 80) ? 'Warning' : 'On Track' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Budget Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ editingBudget ? 'Edit Budget' : 'Create New Budget' }}
          </h2>
          
          <form @submit.prevent="saveBudget" class="space-y-4">
            <!-- Category Selection -->
            <div v-if="!editingBudget">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div class="flex gap-2">
                <select
                  v-model.trim="form.categoryId"
                  class="flex-1 h-[46px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category...</option>
                  <option v-for="cat in expenseCategories" :key="cat.id" :value="String(cat.id)">
                    {{ cat.icon || '' }} {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="!editingBudget && availableSubcategories.length > 0">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory (optional)
              </label>
              <select
                v-model.trim="form.subcategoryId"
                class="w-full h-[46px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Use parent category</option>
                <option v-for="sub in availableSubcategories" :key="sub.id" :value="String(sub.id)">
                  {{ sub.icon || '' }} {{ sub.name }}
                </option>
              </select>
            </div>

            <!-- Budget Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Amount
              </label>
              <input
                v-model.number="form.budgetAmount"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <!-- Alert Threshold -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Threshold (%)
              </label>
              <input
                v-model.number="form.alertThreshold"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Alert will trigger when spending reaches this percentage
              </p>
            </div>

            <!-- Month Selection -->
            <div v-if="!editingBudget">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <input
                v-model="form.month"
                type="month"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <!-- Buttons -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-lavender-600 hover:bg-lavender-700 disabled:bg-gray-400 text-white rounded-lg transition"
              >
                {{ loading ? 'Saving...' : editingBudget ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Budget</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete the budget for <strong>{{ deletingBudget?.category_name }}</strong>?
            This action cannot be undone.
          </p>
          <div class="flex space-x-3">
            <button
              @click="showDeleteModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="loading"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import StatCard from '@/components/StatCard.vue';
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default {
  name: 'BudgetsView',
  components: {
    Navbar,
    Sidebar,
    StatCard,
  },
  data() {
    return {
      budgets: [],
      unreadAlerts: [],
      budgetSummary: {},
      expenseCategories: [],
      showCreateModal: false,
      showDeleteModal: false,
      loading: false,
      selectedMonth: null,
      editingBudget: null,
      deletingBudget: null,
      form: {
        categoryId: '',
        subcategoryId: '',
        budgetAmount: null,
        alertThreshold: 80,
        month: getCurrentMonth(),
      },
    };
  },
  mounted() {
    try {
      this.fetchBudgets();
      this.fetchAlerts();
      this.fetchBudgetSummary();
      this.fetchExpenseCategories();
    } catch (error) {
      console.error('Error in mounted hook:', error);
    }
  },
  watch: {
    expenseCategories: {
      handler() {
        // Force re-render when categories change
        this.$forceUpdate();
      },
      deep: true,
    },
    'form.categoryId': function (newValue) {
      if (!newValue) {
        this.form.subcategoryId = '';
        return;
      }

      const category = this.expenseCategories.find((cat) => String(cat.id) === String(newValue));
      if (!category || !category.subcategories?.some((sub) => String(sub.id) === String(this.form.subcategoryId))) {
        this.form.subcategoryId = '';
      }
    },
  },
  computed: {
    availableSubcategories() {
      const category = this.expenseCategories.find((cat) => String(cat.id) === String(this.form.categoryId));
      return category?.subcategories || [];
    },
    displayBudgetSummary() {
      const totalBudgetAmount = this.budgets.reduce(
        (sum, budget) => sum + Number(budget.budget_amount || 0),
        0
      );
      const totalSpending = this.budgets.reduce(
        (sum, budget) => sum + Number(budget.current_spending || 0),
        0
      );

      return {
        total_budgets: this.budgets.length,
        total_budget_amount: totalBudgetAmount,
        total_spending: totalSpending,
        warning_count: this.budgetSummary.warning_count || 0,
        exceeded_count: this.budgetSummary.exceeded_count || 0,
      };
    },
  },
  methods: {
    formatCurrency,
    async fetchBudgets() {
      try {
        const params = {};
        if (this.selectedMonth) {
          params.month = this.selectedMonth;
        }
        const response = await apiClient.get('/budgets', { params });
        this.budgets = response.data?.data || [];
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    },
    async fetchAlerts() {
      try {
        const response = await apiClient.get('/budgets/alerts/list?isRead=false');
        this.unreadAlerts = response.data?.data || [];
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    },
    async fetchBudgetSummary() {
      try {
        const params = {};
        if (this.selectedMonth) {
          params.month = this.selectedMonth;
        }
        const response = await apiClient.get('/budgets/summary', { params });
        this.budgetSummary = response.data?.data || {};
      } catch (error) {
        console.error('Error fetching budget summary:', error);
      }
    },
    async fetchExpenseCategories() {
      try {
        // Fetch expense categories hierarchy for budget creation/editing
        // Budgets are set against expense categories to control spending
        const response = await apiClient.get('/expense-categories/hierarchy');
        this.expenseCategories = response.data?.data || [];
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    async saveBudget() {
      if (!this.form.budgetAmount || (!this.editingBudget && !this.form.categoryId)) {
        alert('Please fill in all required fields');
        return;
      }

      this.loading = true;
      try {
        const payload = {
          budgetAmount: this.form.budgetAmount,
          alertThreshold: this.form.alertThreshold,
        };

        if (!this.editingBudget) {
          payload.categoryId = this.form.subcategoryId || this.form.categoryId;
          payload.month = this.form.month;
        }

        if (this.editingBudget) {
          await apiClient.put(`/budgets/${this.editingBudget.id}`, payload);
        } else {
          await apiClient.post('/budgets', payload);
        }

        this.closeModal();
        this.fetchBudgets();
        this.fetchBudgetSummary();
      } catch (error) {
        console.error('Error saving budget:', error);
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving budget';
        alert(message);
      } finally {
        this.loading = false;
      }
    },
    editBudget(budget) {
      this.editingBudget = budget;
      this.form.budgetAmount = budget.budget_amount;
      this.form.alertThreshold = budget.alert_threshold;
      this.showCreateModal = true;
    },
    deleteBudgetConfirm(budget) {
      this.deletingBudget = budget;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      if (!this.deletingBudget) return;

      this.loading = true;
      try {
        await apiClient.delete(`/budgets/${this.deletingBudget.id}`);
        this.showDeleteModal = false;
        this.deletingBudget = null;
        this.fetchBudgets();
        this.fetchBudgetSummary();
      } catch (error) {
        console.error('Error deleting budget:', error);
      } finally {
        this.loading = false;
      }
    },
    async markAlertRead(alertId) {
      try {
        await apiClient.put(`/budgets/alerts/${alertId}/read`);
        await this.fetchAlerts();
        await this.fetchBudgetSummary();
      } catch (error) {
        console.error('Error marking alert as read:', error);
      }
    },
    async markAllAlertsRead() {
      try {
        await apiClient.put('/budgets/alerts/mark-all/read');
        this.unreadAlerts = [];
        await this.fetchAlerts();
        await this.fetchBudgetSummary();
      } catch (error) {
        console.error('Error marking alerts as read:', error);
      }
    },
    closeModal() {
      this.showCreateModal = false;
      this.editingBudget = null;
      this.form = {
        categoryId: '',
        subcategoryId: '',
        budgetAmount: null,
        alertThreshold: 80,
        month: getCurrentMonth(),
      };
    },
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
};
</script>