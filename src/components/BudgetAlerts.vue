<template>
  <div class="relative">
    <!-- Alert Bell Icon -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        ></path>
      </svg>
      <!-- Unread Count Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
      >
        {{ Math.min(unreadCount, 99) }}{{ unreadCount > 99 ? '+' : '' }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      <!-- Header -->
      <div class="sticky top-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
        <h3 class="font-semibold text-gray-900 dark:text-white">Budget Alerts</h3>
        <button
          v-if="alerts.length > 0"
          @click="markAllAsRead"
          class="text-xs text-lavender-600 hover:text-lavender-700 dark:text-lavender-400"
        >
          Mark all read
        </button>
      </div>

      <!-- Alert Items -->
      <div v-if="alerts.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>No alerts</p>
      </div>
      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          :class="[
            'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition',
            !alert.is_read && 'bg-blue-50 dark:bg-blue-900 bg-opacity-50'
          ]"
          @click="handleAlertClick(alert)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <span class="text-lg">
                  {{ alert.alert_type === 'EXCEEDED' ? '🚨' : '⚠️' }}
                </span>
                <p
                  :class="[
                    'font-semibold text-sm',
                    alert.alert_type === 'EXCEEDED'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  ]"
                >
                  {{ alert.alert_type === 'EXCEEDED' ? 'Budget Exceeded' : 'Budget Warning' }}
                </p>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {{ alert.category_name }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ alert.percentage_used || 0 }}% of {{ formatCurrency(alert.budget_amount || 0) }} • Spent: {{ formatCurrency(alert.current_spending || 0) }}
              </p>
            </div>
            <span
              v-if="!alert.is_read"
              class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"
            ></span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="alerts.length > 0" class="sticky bottom-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <router-link
          to="/budgets"
          class="block text-center text-sm text-lavender-600 hover:text-lavender-700 dark:text-lavender-400 font-medium"
        >
          View all budgets →
        </router-link>
      </div>
    </div>

    <!-- Close dropdown when clicking outside -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    ></div>
  </div>
</template>

<script>
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default {
  name: 'BudgetAlerts',
  data() {
    return {
      alerts: [],
      unreadCount: 0,
      showDropdown: false,
      pollInterval: null,
    };
  },
  mounted() {
    this.fetchAlerts();
    // Poll for new alerts every 30 seconds, but only if not already polling
    if (!this.pollInterval) {
      this.pollInterval = setInterval(() => {
        this.fetchAlerts();
      }, 30000);
    }
  },
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  },
  methods: {
    formatCurrency,
    async fetchAlerts() {
      try {
        const response = await apiClient.get('/budgets/alerts/list?isRead=false');
        const alerts = response.data?.data || [];
        this.alerts = alerts.slice(0, 10);
        this.unreadCount = alerts.filter(a => !a.is_read).length;
      } catch (error) {
        // Only log errors, don't throw - prevents component from breaking
        console.error('Error fetching alerts:', error);
        // Reset to empty state on error
        this.alerts = [];
        this.unreadCount = 0;
      }
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    async handleAlertClick(alert) {
      if (!alert.is_read) {
        try {
          await apiClient.put(`/budgets/alerts/${alert.id}/read`);
          await this.fetchAlerts();
          this.unreadCount = this.alerts.filter((a) => !a.is_read).length;
          window.dispatchEvent(new CustomEvent('budget-alerts-updated'));
        } catch (error) {
          console.error('Error marking alert as read:', error);
        }
      }
    },
    async markAllAsRead() {
      try {
        await apiClient.put('/budgets/alerts/mark-all/read');
        this.alerts = [];
        this.unreadCount = 0;
        await this.fetchAlerts();
        window.dispatchEvent(new CustomEvent('budget-alerts-updated'));
        this.showDropdown = false;
      } catch (error) {
        console.error('Error marking alerts as read:', error);
      }
    },
  },
};
</script>
