<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Page Title -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Manage users and view system statistics</p>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
                <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.users?.total || 0 }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">System users</p>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Users</h3>
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.users?.activeInLastMonth || 0 }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Last 30 days</p>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Transactions</h3>
                <svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalTransactions }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">All records</p>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses</h3>
                <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.35 11.35l-4-4v5.65h-2v-5.65l-4 4L4.65 12 12 4.65 19.35 12l-2.65 1.35z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.amounts?.totalExpenses || 0) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">All users</p>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income</h3>
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.amounts?.totalIncome || 0) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">All users</p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-6 flex border-b border-gray-200 dark:border-gray-600">
            <button
              @click="activeTab = 'users'"
              :class="{ 'border-b-2 border-lavender-600 text-lavender-600': activeTab === 'users' }"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              👥 Users Management
            </button>
            <button
              @click="activeTab = 'expenses'"
              :class="{ 'border-b-2 border-lavender-600 text-lavender-600': activeTab === 'expenses' }"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              📊 All Expenses
            </button>
            <button
              @click="activeTab = 'income'"
              :class="{ 'border-b-2 border-lavender-600 text-lavender-600': activeTab === 'income' }"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              💰 All Income
            </button>
            <button
              @click="activeTab = 'transfers'"
              :class="{ 'border-b-2 border-lavender-600 text-lavender-600': activeTab === 'transfers' }"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              🔄 All Transfers
            </button>
          </div>

          <!-- Users Tab -->
          <div v-if="activeTab === 'users'" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">All Users</h2>
                <button @click="refreshUsers" class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm">
                  🔄 Refresh
                </button>
              </div>

              <div v-if="loading.users" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">Loading users...</p>
              </div>

              <div v-else-if="users.length === 0" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No users found</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Transactions</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Accounts</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ user.email }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ user.first_name }} {{ user.last_name }}</td>
                      <td class="px-6 py-4 text-sm">
                        <span :class="{ 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200': user.role === 'admin', 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200': user.role === 'user' }" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm">
                        <span :class="{ 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200': user.is_active, 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200': !user.is_active }" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ user.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ user.stats?.expenses + user.stats?.income || 0 }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ user.stats?.accounts || 0 }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(user.created_at) }}</td>
                      <td class="px-6 py-4 text-sm">
                        <div class="flex flex-wrap gap-2">
                          <button
                            @click="viewUserDetails(user.id)"
                            title="View user details"
                            class="inline-flex items-center px-3 py-1 bg-lavender-100 dark:bg-lavender-900 text-lavender-700 dark:text-lavender-200 rounded-full text-xs font-medium hover:bg-lavender-200 dark:hover:bg-lavender-800 transition"
                          >
                            View
                          </button>
                          <button
                            @click="toggleUserRole(user)"
                            title="Change user role"
                            class="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                          >
                            {{ user.role === 'admin' ? 'Demote' : 'Promote' }}
                          </button>
                          <button
                            @click="resetPassword(user)"
                            title="Reset user password"
                            class="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                          >
                            Reset
                          </button>
                          <button
                            @click="toggleUserStatus(user)"
                            :class="{
                              'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800': user.is_active,
                              'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800': !user.is_active
                            }"
                            title="Toggle account status"
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition"
                          >
                            {{ user.is_active ? 'Deactivate' : 'Activate' }}
                          </button>
                          <button
                            v-if="user.role !== 'admin'"
                            @click="deleteUser(user)"
                            title="Permanently delete user"
                            class="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- User Details Modal -->
          <div v-if="selectedUserDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg max-w-4xl max-h-96 overflow-y-auto w-full mx-4 p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedUserDetails.user?.email }}</h2>
                <button @click="selectedUserDetails = null" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>

              <!-- User Summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="p-3 bg-gray-50 dark:bg-gray-600 rounded">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedUserDetails.summary?.expensesCount }}</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-600 rounded">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Income</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedUserDetails.summary?.incomeCount }}</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-600 rounded">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Accounts</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedUserDetails.summary?.accountsCount }}</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-600 rounded">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Transfers</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedUserDetails.summary?.transfersCount }}</p>
                </div>
              </div>

              <!-- Recent Transactions -->
              <div class="mb-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-2">Recent Expenses</h3>
                <div class="space-y-1 text-sm max-h-32 overflow-y-auto">
                  <div v-for="expense in selectedUserDetails.expenses?.slice(0, 5)" :key="expense.id" class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{{ expense.category_name }} - {{ expense.description }}</span>
                    <span>-{{ formatCurrency(expense.amount) }}</span>
                  </div>
                  <div v-if="selectedUserDetails.expenses?.length === 0" class="text-gray-500 dark:text-gray-400">No expenses</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reset Password Modal -->
          <div v-if="showResetPasswordModal && resetPasswordUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reset Password</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Reset password for: <span class="font-semibold">{{ resetPasswordUser.email }}</span>
              </p>

              <form @submit.prevent="handleResetPassword" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    v-model="newPassword"
                    type="password"
                    placeholder="Enter new password (8-32 chars, uppercase, lowercase, special char)"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                    required
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">8-32 characters, include uppercase, lowercase and special character</p>
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    type="submit"
                    class="flex-1 px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white font-medium rounded-lg transition"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    @click="closeResetPasswordModal"
                    class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div v-if="activeTab === 'expenses'" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">All Expenses</h2>
                <button @click="fetchAllExpenses" class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm">
                  🔄 Refresh
                </button>
              </div>

              <div v-if="loading.expenses" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">Loading expenses...</p>
              </div>

              <div v-else-if="allExpenses.length === 0" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No expenses found</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">User</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="expense in allExpenses" :key="expense.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ expense.first_name }} {{ expense.last_name }}</td>
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ expense.category_name }}</td>
                      <td class="px-4 py-2 text-red-600 dark:text-red-400 font-medium">-{{ formatCurrency(expense.amount) }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ formatDate(expense.expense_date) }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ expense.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Income Tab -->
          <div v-if="activeTab === 'income'" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">All Income</h2>
                <button @click="fetchAllIncome" class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm">
                  🔄 Refresh
                </button>
              </div>

              <div v-if="loading.income" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">Loading income...</p>
              </div>

              <div v-else-if="allIncome.length === 0" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No income found</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">User</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="income in allIncome" :key="income.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ income.first_name }} {{ income.last_name }}</td>
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ income.category_name }}</td>
                      <td class="px-4 py-2 text-green-600 dark:text-green-400 font-medium">+{{ formatCurrency(income.amount) }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ formatDate(income.income_date) }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ income.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Transfers Tab -->
          <div v-if="activeTab === 'transfers'" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">All Transfers</h2>
                <button @click="fetchAllTransfers" class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm">
                  🔄 Refresh
                </button>
              </div>

              <div v-if="loading.transfers" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">Loading transfers...</p>
              </div>

              <div v-else-if="allTransfers.length === 0" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No transfers found</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">User</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">From Account</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">To Account</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="transfer in allTransfers" :key="transfer.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ transfer.first_name }} {{ transfer.last_name }}</td>
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ transfer.from_account_name }}</td>
                      <td class="px-4 py-2 text-gray-900 dark:text-white">{{ transfer.to_account_name }}</td>
                      <td class="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium">{{ formatCurrency(transfer.amount) }}</td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ formatDate(transfer.created_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
import { formatCurrency } from '@/lib/utils'

const activeTab = ref('users')
const loading = ref({
  users: false,
  expenses: false,
  income: false,
  transfers: false,
})

const stats = ref({
  users: {},
  transactions: {},
  amounts: {},
  accounts: {},
})

const users = ref([])
const allExpenses = ref([])
const allIncome = ref([])
const allTransfers = ref([])
const selectedUserDetails = ref(null)
const showResetPasswordModal = ref(false)
const resetPasswordUser = ref(null)
const newPassword = ref('')

const totalTransactions = ref(0)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats')
    if (response.data.success) {
      stats.value = response.data.data
      totalTransactions.value = 
        (response.data.data.transactions?.expenses || 0) +
        (response.data.data.transactions?.income || 0) +
        (response.data.data.transactions?.transfers || 0)
    }
  } catch (error) {
    console.error('Failed to fetch stats', error)
  }
}

const refreshUsers = async () => {
  loading.value.users = true
  try {
    const response = await apiClient.get('/admin/users')
    if (response.data.success) {
      // Filter to show only authenticated users (email verified) or admin users
      users.value = response.data.data.filter(user => user.email_verified || user.role === 'admin')
    }
  } catch (error) {
    console.error('Failed to fetch users', error)
    alert('Failed to fetch users')
  } finally {
    loading.value.users = false
  }
}

const fetchAllExpenses = async () => {
  loading.value.expenses = true
  try {
    const response = await apiClient.get('/admin/expenses')
    if (response.data.success) {
      allExpenses.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch expenses', error)
    alert('Failed to fetch expenses')
  } finally {
    loading.value.expenses = false
  }
}

const fetchAllIncome = async () => {
  loading.value.income = true
  try {
    const response = await apiClient.get('/admin/income')
    if (response.data.success) {
      allIncome.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch income', error)
    alert('Failed to fetch income')
  } finally {
    loading.value.income = false
  }
}

const fetchAllTransfers = async () => {
  loading.value.transfers = true
  try {
    const response = await apiClient.get('/admin/transfers')
    if (response.data.success) {
      allTransfers.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch transfers', error)
    alert('Failed to fetch transfers')
  } finally {
    loading.value.transfers = false
  }
}

const viewUserDetails = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`)
    if (response.data.success) {
      selectedUserDetails.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch user details', error)
    alert('Failed to fetch user details')
  }
}

const toggleUserRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const confirmed = window.confirm(`Change user role to ${newRole}?`)
  
  if (!confirmed) return

  try {
    const response = await apiClient.patch(`/admin/users/${user.id}/role`, {
      role: newRole,
    })
    if (response.data.success) {
      user.role = newRole
      alert('User role updated successfully')
    }
  } catch (error) {
    console.error('Failed to update user role', error)
    alert('Failed to update user role')
  }
}

const toggleUserStatus = async (user) => {
  const action = user.is_active ? 'deactivate' : 'reactivate'
  const confirmed = window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)
  
  if (!confirmed) return

  try {
    const endpoint = user.is_active ? 'deactivate' : 'reactivate'
    const response = await apiClient.patch(`/admin/users/${user.id}/${endpoint}`)
    if (response.data.success) {
      user.is_active = !user.is_active
      alert(`User ${action}d successfully`)
    }
  } catch (error) {
    console.error(`Failed to ${action} user`, error)
    alert(`Failed to ${action} user`)
  }
}

const resetPassword = (user) => {
  resetPasswordUser.value = user
  newPassword.value = ''
  showResetPasswordModal.value = true
}

const handleResetPassword = async () => {
  const pwdRegex = /^(?=.{8,32}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/
  if (!newPassword.value || !pwdRegex.test(newPassword.value)) {
    alert('Password must be 8–32 characters and include uppercase, lowercase and a special character')
    return
  }

  try {
    const response = await apiClient.patch(`/admin/users/${resetPasswordUser.value.id}/reset-password`, {
      newPassword: newPassword.value,
    })
    if (response.data.success) {
      alert(response.data.message)
      showResetPasswordModal.value = false
      resetPasswordUser.value = null
      newPassword.value = ''
    }
  } catch (error) {
    console.error('Failed to reset password', error)
    alert(error.response?.data?.message || 'Failed to reset password')
  }
}

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  resetPasswordUser.value = null
  newPassword.value = ''
}

const deleteUser = async (user) => {
  const confirmed = window.confirm(
    `Are you sure you want to permanently delete user "${user.email}"? This action cannot be undone and all associated data (expenses, income, accounts, transfers) will be deleted.`
  )

  if (!confirmed) return

  try {
    const response = await apiClient.delete(`/admin/users/${user.id}`)
    if (response.data.success) {
      alert('User deleted successfully')
      // Remove user from the list
      users.value = users.value.filter(u => u.id !== user.id)
    }
  } catch (error) {
    console.error('Failed to delete user', error)
    alert(error.response?.data?.message || 'Failed to delete user')
  }
}

onMounted(() => {
  fetchStats()
  refreshUsers()
})
</script>
