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
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your application preferences</p>
          </div>

          <!-- Theme Settings -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Enable dark mode for the application</p>
                </div>
                <button
                  @click="toggleDarkMode"
                  :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors', isDarkMode ? 'bg-lavender-600' : 'bg-gray-300']"
                >
                  <span
                    :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform', isDarkMode ? 'translate-x-6' : 'translate-x-1']"
                  ></span>
                </button>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Select your preferred currency for display</p>
                </div>
                <select
                  v-model="selectedCurrency"
                  @change="updateCurrency"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 dark:text-white"
                >
                  <option v-for="curr in availableCurrencies" :key="curr" :value="curr">
                    {{ getCurrencySymbol(curr) }} {{ curr }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Expense Categories -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Expense Categories</h2>
              <button
                @click="showExpenseCategoryForm = !showExpenseCategoryForm"
                class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm font-medium"
              >
                + Add Category
              </button>
            </div>
            
            <!-- Add Expense Category Form -->
            <div v-if="showExpenseCategoryForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-600 rounded">
              <div class="space-y-3">
                <div class="flex items-center gap-2 relative">
                  <button
                    @click="toggleEmojiPicker('expense')"
                    class="px-2 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white text-center min-w-[50px]"
                  >
                    {{ newExpenseCategory.icon || '😊' }}
                  </button>
                  <input
                    v-model="newExpenseCategory.name"
                    type="text"
                    placeholder="Category name (e.g., Coffee)"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    v-if="newExpenseCategory.icon"
                    @click="newExpenseCategory.icon = ''"
                    class="px-2 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded"
                  >
                    ✕
                  </button>
                  <!-- Emoji Picker Popup -->
                  <div v-if="showEmojiPicker.expense" class="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg p-2 w-64 max-h-40 overflow-y-auto">
                    <div class="grid grid-cols-6 gap-1">
                      <button
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        @click="selectEmoji(emoji, 'expense')"
                        class="text-lg hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                        :title="emoji"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-300 mb-1">Parent Category (optional)</label>
                  <select
                    v-model="newExpenseCategory.parentId"
                    class="w-full h-[45px] py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">No parent (main category)</option>
                    <option v-for="opt in expenseCategoriesFlat" :key="opt.id" :value="opt.id">
                      {{ opt.icon ? opt.icon + ' ' : '' }}{{ opt.name }}
                    </option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="addExpenseCategory"
                    class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Add
                  </button>
                  <button
                    @click="showExpenseCategoryForm = false; resetExpenseForm()"
                    class="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Expense Categories List -->
            <div class="space-y-2">
              <div v-if="expenseCategories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
                No expense categories yet
              </div>
              <div v-for="cat in expenseCategories" :key="cat.id" class="p-2 bg-gray-50 dark:bg-gray-600 rounded">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                      <span class="text-gray-900 dark:text-white">{{ cat.icon || '' }} {{ cat.name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        @click="toggleSubForm(cat.id)"
                        class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                      >
                        + Subcategory
                      </button>
                      <button
                        @click="deleteExpenseCategory(cat.id)"
                        class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                </div>

                <!-- Inline subcategory form -->
                <div v-if="showSubForm[cat.id]" class="mt-2 pl-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 relative">
                      <button
                        @click="toggleEmojiPicker('expense', cat.id)"
                        class="px-2 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white text-center min-w-[50px]"
                      >
                        {{ subCategoryInputs[cat.id]?.icon || '😊' }}
                      </button>
                      <input
                        v-model="subCategoryInputs[cat.id].name"
                        type="text"
                        placeholder="Subcategory name (e.g., Latte)"
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        v-if="subCategoryInputs[cat.id]?.icon"
                        @click="subCategoryInputs[cat.id].icon = ''"
                        class="px-2 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded"
                      >
                        ✕
                      </button>
                      <!-- Emoji Picker Popup -->
                      <div v-if="showEmojiPicker[`expense-${cat.id}`]" class="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg p-2 w-64 max-h-40 overflow-y-auto">
                        <div class="grid grid-cols-6 gap-1">
                          <button
                            v-for="emoji in emojiOptions"
                            :key="emoji"
                            @click="selectEmoji(emoji, 'expense', cat.id)"
                            class="text-lg hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                            :title="emoji"
                          >
                            {{ emoji }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button @click="addSubcategory(cat.id)" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Add</button>
                      <button @click="cancelSubForm(cat.id)" class="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm">Cancel</button>
                    </div>
                  </div>
                </div>

                <div v-if="cat.subcategories && cat.subcategories.length" class="pl-4 mt-2 space-y-1">
                  <div v-for="sub in cat.subcategories" :key="sub.id" class="flex justify-between items-center p-1 bg-white dark:bg-gray-700 rounded">
                    <span class="text-sm text-gray-800 dark:text-gray-300">{{ sub.icon || '' }} {{ sub.name }}</span>
                    <button
                      @click="deleteExpenseCategory(sub.id)"
                      class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Income Categories -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Income Categories</h2>
              <button
                @click="showIncomeCategoryForm = !showIncomeCategoryForm"
                class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm font-medium"
              >
                + Add Category
              </button>
            </div>
            
            <!-- Add Income Category Form -->
            <div v-if="showIncomeCategoryForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-600 rounded">
              <div class="space-y-3">
                <div class="flex items-center gap-2 relative">
                  <button
                    @click="toggleEmojiPicker('income')"
                    class="px-2 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white text-center min-w-[50px]"
                  >
                    {{ newIncomeCategory.icon || '😊' }}
                  </button>
                  <input
                    v-model="newIncomeCategory.name"
                    type="text"
                    placeholder="Category name (e.g., Salary)"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    v-if="newIncomeCategory.icon"
                    @click="newIncomeCategory.icon = ''"
                    class="px-2 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded"
                  >
                    ✕
                  </button>
                  <!-- Emoji Picker Popup -->
                  <div v-if="showEmojiPicker.income" class="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg p-2 w-64 max-h-40 overflow-y-auto">
                    <div class="grid grid-cols-6 gap-1">
                      <button
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        @click="selectEmoji(emoji, 'income')"
                        class="text-lg hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                        :title="emoji"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-300 mb-1">Parent Category (optional)</label>
                  <select v-model="newIncomeCategory.parentId" class="w-full h-[45px] py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white">
                    <option value="">No parent (main category)</option>
                    <option v-for="opt in incomeCategoriesFlat" :key="opt.id" :value="opt.id">
                      {{ opt.icon ? opt.icon + ' ' : '' }}{{ opt.name }}
                    </option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="addIncomeCategory"
                    class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Add
                  </button>
                  <button
                    @click="showIncomeCategoryForm = false; newIncomeCategory = { name: '', parentId: '', icon: '' }; showEmojiPicker.income = false"
                    class="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Income Categories List -->
            <div class="space-y-2">
              <div v-if="incomeCategories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
                No income categories yet
              </div>
              <div v-for="cat in incomeCategories" :key="cat.id" class="flex flex-col p-2 bg-gray-50 dark:bg-gray-600 rounded">
                <div class="flex justify-between items-center">
                  <span class="text-gray-900 dark:text-white">{{ cat.icon || '' }} {{ cat.name }}</span>
                  <div class="flex items-center gap-2">
                    <button @click="toggleSubForm(cat.id)" class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs">+ Subcategory</button>
                    <button
                      @click="deleteIncomeCategory(cat.id)"
                      class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <!-- Inline subcategory form for income -->
                <div v-if="showSubForm[cat.id]" class="mt-2 pl-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 relative">
                      <button
                        @click="toggleEmojiPicker('income', cat.id)"
                        class="px-2 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white text-center min-w-[50px]"
                      >
                        {{ subCategoryInputs[cat.id]?.icon || '😊' }}
                      </button>
                      <input
                        v-model="subCategoryInputs[cat.id].name"
                        type="text"
                        placeholder="Subcategory name (e.g., Freelance)"
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        v-if="subCategoryInputs[cat.id]?.icon"
                        @click="subCategoryInputs[cat.id].icon = ''"
                        class="px-2 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded"
                      >
                        ✕
                      </button>
                      <!-- Emoji Picker Popup -->
                      <div v-if="showEmojiPicker[`income-${cat.id}`]" class="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg p-2 w-64 max-h-40 overflow-y-auto">
                        <div class="grid grid-cols-6 gap-1">
                          <button
                            v-for="emoji in emojiOptions"
                            :key="emoji"
                            @click="selectEmoji(emoji, 'income', cat.id)"
                            class="text-lg hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                            :title="emoji"
                          >
                            {{ emoji }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button @click="addIncomeSubcategory(cat.id)" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Add</button>
                      <button @click="cancelSubForm(cat.id)" class="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
                <div v-if="cat.subcategories && cat.subcategories.length" class="pl-4 mt-2 space-y-1">
                  <div v-for="sub in cat.subcategories" :key="sub.id" class="flex justify-between items-center p-1 bg-white dark:bg-gray-700 rounded">
                    <span class="text-sm text-gray-800 dark:text-gray-300">{{ sub.icon || '' }} {{ sub.name }}</span>
                    <button @click="deleteIncomeCategory(sub.id)" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Categories -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Account Types</h2>
              <button
                @click="showAccountCategoryForm = !showAccountCategoryForm"
                class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm font-medium"
              >
                + Add Type
              </button>
            </div>
            
            <!-- Add Account Category Form -->
            <div v-if="showAccountCategoryForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-600 rounded">
              <div class="space-y-3">
                <input
                  v-model="newAccountCategory"
                  type="text"
                  placeholder="e.g., Cash, Savings Account, Credit Card, Debit Card"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                />
                <div class="flex gap-2">
                  <button
                    @click="addAccountCategory"
                    class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Add
                  </button>
                  <button
                    @click="showAccountCategoryForm = false; newAccountCategory = ''"
                    class="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Account Categories List -->
            <div class="space-y-2">
              <div v-if="accountCategories.length === 0 && !showAccountCategoryForm" class="text-gray-500 dark:text-gray-400 text-sm">
                Click "Add Type" to create account types
              </div>
              <div v-for="(cat, idx) in accountCategories" :key="idx" class="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-600 dark:to-gray-700 rounded border border-blue-200 dark:border-gray-500">
                <span class="text-gray-900 dark:text-white font-medium">{{ cat }}</span>
                <button
                  @click="deleteAccountCategory(idx)"
                  class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Accounts Management -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Accounts</h2>
              <button
                @click="showCreateAccountForm = !showCreateAccountForm"
                class="px-3 py-1 bg-lavender-600 hover:bg-lavender-700 text-white rounded text-sm font-medium"
              >
                + Create Account
              </button>
            </div>

            <!-- Create Account Form -->
            <div v-if="showCreateAccountForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-600 rounded border border-lavender-200 dark:border-lavender-700">
              <form @submit.prevent="handleCreateAccount" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                  <input
                    v-model="newAccount.name"
                    type="text"
                    placeholder="e.g., My Savings"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                  <select
                    v-model="newAccount.accountType"
                    class="w-full h-[46px] py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Account Type</option>
                    <option v-for="(type, idx) in accountCategories" :key="idx" :value="type">
                      {{ type }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Add account types above first</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Balance</label>
                    <input
                      v-model.number="newAccount.balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select
                      v-model="newAccount.currency"
                      class="w-full h-[42px] py-2 border border-gray-300 dark:border-gray-500 rounded dark:bg-gray-700 dark:text-white"
                    >
                      <option v-for="curr in availableCurrencies" :key="curr" :value="curr">
                        {{ getCurrencySymbol(curr) }} {{ curr }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="submit" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                    Create Account
                  </button>
                  <button type="button" @click="resetCreateAccountForm" class="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Accounts List -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-if="!loadingAccounts && accounts.length === 0"
                class="col-span-full text-center py-6 text-gray-500 dark:text-gray-400"
              >
                No accounts yet. Create one above.
              </div>
              <div
                v-for="account in accounts"
                :key="account.id"
                class="p-4 bg-gradient-to-br from-lavender-50 to-lavender-100 dark:from-gray-600 dark:to-gray-700 rounded-lg border border-lavender-200 dark:border-gray-500"
              >
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {{ account.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Account</p>
                  </div>
                  <span
                    v-if="account.account_type"
                    class="text-xs px-2 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {{ account.account_type }}
                  </span>
                </div>
                <div class="space-y-2 relative pb-8">
                  <div class="flex justify-between items-end">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">
                      {{ formatCurrency(account.balance || 0) }}
                    </span>
                  </div>
                  <div
                    v-if="account.currency"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Currency: {{ account.currency }}
                  </div>
                  <button
                    @click="deleteAccount(account.id)"
                    class="absolute bottom-0 right-0 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- ✅ IMPORTANT Changes -->

          <!-- Notification Settings -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Receive updates via email</p>
                </div>
                <input
                  v-model="settings.emailNotifications"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-lavender-600"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</label>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Receive browser notifications</p>
                </div>
                <input
                  v-model="settings.pushNotifications"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-lavender-600"
                />
              </div>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Privacy & Security</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</label>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Enhance your account security</p>
                </div>
                <button
                  @click="enable2FA"
                  :class="['px-3 py-1 rounded text-sm font-medium transition', settings.twoFactorAuth ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300']"
                >
                  {{ settings.twoFactorAuth ? 'Enabled' : 'Enable' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Data & Privacy -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Data</h2>
            <div class="space-y-3">
              <button
                @click="exportData"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-left font-medium"
              >
                📥 Export Data
              </button>
              <button
                @click="deleteUserAccount"
                class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-left font-medium"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex gap-3">
            <button
              @click="saveSettings"
              class="px-6 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg transition font-medium"
            >
              Save Settings
            </button>
            <button
              @click="resetSettings"
              class="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- Delete Account Modal -->
  <div v-if="showDeleteAccountModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Delete Account</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        This action is permanent and cannot be undone. All your data (expenses, income, accounts, transfers) will be permanently deleted.
      </p>

      <form @submit.prevent="confirmDeleteAccount" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter your password to confirm
          </label>
          <input
            v-model="deleteAccountPassword"
            type="password"
            placeholder="Enter your password"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
          >
            Delete My Account
          </button>
          <button
            type="button"
            @click="closeDeleteAccountModal"
            class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
import apiClient from '@/lib/api'
import { useCategoriesStore } from '@/stores/categories'
import { formatCurrency, getPreferredCurrency, setPreferredCurrency, getAvailableCurrencies, getCurrencySymbol } from '@/lib/utils'

const categoriesStore = useCategoriesStore()
const accounts = ref([])
const loadingAccounts = ref(false)
const isDarkMode = ref(false)

// Computed properties for categories from store
const expenseCategories = computed(() => categoriesStore.expenseCategories)
const incomeCategories = computed(() => categoriesStore.incomeCategories)
const expenseCategoriesFlat = computed(() => categoriesStore.flatExpenseCategories)
const incomeCategoriesFlat = computed(() => categoriesStore.flatIncomeCategories)
const showExpenseCategoryForm = ref(false)
const showIncomeCategoryForm = ref(false)
const showAccountCategoryForm = ref(false)
const showCreateAccountForm = ref(false)
const accountCategories = ref([])
const newExpenseCategory = ref({ name: '', parentId: '', icon: '' })
const newIncomeCategory = ref({ name: '', parentId: '', icon: '' })
const newAccountCategory = ref('')
const newAccount = ref({
  name: '',
  accountType: '',
  balance: 0,
  currency: 'INR',
})

// Emoji options for categories
const emojiOptions = ref([
  // Food & Dining
  '🍽️', '🍕', '🍔', '🍟', '🍱', '🥗', '☕', '🍵', '🥬', '🍎', '🥤',
  // Transportation
  '🚗', '🚕', '🏍️', '🚌', '🚇', '🚊', '✈️', '🚲', '⛽', '🛵', '🚚',
  // Shopping
  '🛍️', '👕', '👖', '👠', '👟', '💻', '📱', '💄', '🛀', '🏠', '🛋️',
  // Entertainment
  '🎬', '🎵', '🎮', '📺', '🎭', '🎪', '🎨', '📖', '🎸', '🎹', '🎤',
  // Bills & Utilities
  '💡', '💧', '📱', '🏠', '🛜', '⚡', '📺', '🌐', '📞', '💳', '🏦',
  // Health & Fitness
  '💊', '🏥', '🦷', '🏃', '💪', '🧘', '⚕️', '🩺', '🩹', '🏥', '🩸',
  // Education
  '📚', '🎓', '✏️', '📝', '🔬', '🧮', '📐', '🎒', '👨‍🏫', '👩‍🏫', '🏫',
  // Travel
  '✈️', '🏖️', '🏔️', '🏨', '🗽', '🗼', '🌉', '🚢', '🛳️', '🏝️', '🌍',
  // Other
  '💼', '💰', '📊', '🎁', '💝', '🔧', '🛠️', '💹', '🎯', '⭐', '💎', '😊'
])

// State for emoji picker visibility
const showEmojiPicker = ref({})

// Delete account modal
const showDeleteAccountModal = ref(false)
const deleteAccountPassword = ref('')

// Currency settings
const selectedCurrency = ref(getPreferredCurrency())
const availableCurrencies = getAvailableCurrencies()

const updateCurrency = () => {
  setPreferredCurrency(selectedCurrency.value)
}

const settings = ref({
  emailNotifications: true,
  pushNotifications: true,
  twoFactorAuth: false,
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const fetchCategories = async () => {
  await categoriesStore.fetchCategories()
}

// Subcategory UI state
const showSubForm = ref({})
const subCategoryInputs = ref({})

const toggleSubForm = (parentId) => {
  showSubForm.value = { ...showSubForm.value, [parentId]: !showSubForm.value[parentId] }
  if (showSubForm.value[parentId]) {
    subCategoryInputs.value = { ...subCategoryInputs.value, [parentId]: { name: '', icon: '' } }
  }
}

const cancelSubForm = (parentId) => {
  showSubForm.value = { ...showSubForm.value, [parentId]: false }
  subCategoryInputs.value = { ...subCategoryInputs.value, [parentId]: { name: '', icon: '' } }
  showEmojiPicker.value = { ...showEmojiPicker.value, [`expense-${parentId}`]: false, [`income-${parentId}`]: false }
}

const addSubcategory = async (parentId) => {
  const input = subCategoryInputs.value[parentId] || { name: '', icon: '' }
  const name = (input.name || '').trim()
  if (!name) return
  try {
    const payload = {
      name,
      icon: input.icon || null,
      parentCategoryId: parentId,
    }
    await categoriesStore.addExpenseCategory(payload)
    cancelSubForm(parentId)
    alert('Subcategory added successfully!')
  } catch (error) {
    console.error('Failed to add subcategory', error)
    alert('Error: ' + (error.response?.data?.message || error.message))
  }
}

// Emoji picker functions
const toggleEmojiPicker = (formType, parentId = null) => {
  const key = parentId ? `${formType}-${parentId}` : formType
  showEmojiPicker.value = { ...showEmojiPicker.value, [key]: !showEmojiPicker.value[key] }
}

const selectEmoji = (emoji, formType, parentId = null) => {
  if (parentId) {
    // For subcategory forms
    subCategoryInputs.value = {
      ...subCategoryInputs.value,
      [parentId]: { ...subCategoryInputs.value[parentId], icon: emoji }
    }
  } else {
    // For main category forms
    if (formType === 'expense') {
      newExpenseCategory.value = { ...newExpenseCategory.value, icon: emoji }
    } else if (formType === 'income') {
      newIncomeCategory.value = { ...newIncomeCategory.value, icon: emoji }
    }
  }
  // Hide picker after selection
  const key = parentId ? `${formType}-${parentId}` : formType
  showEmojiPicker.value = { ...showEmojiPicker.value, [key]: false }
}

const addExpenseCategory = async () => {
  if (!newExpenseCategory.value.name || !newExpenseCategory.value.name.trim()) return
  try {
    const payload = {
      name: newExpenseCategory.value.name,
      icon: newExpenseCategory.value.icon || null,
      parentCategoryId: newExpenseCategory.value.parentId || null,
    }
    await categoriesStore.addExpenseCategory(payload)
    resetExpenseForm()
    showExpenseCategoryForm.value = false
    alert('Expense category added successfully!')
  } catch (error) {
    console.error('Failed to add expense category', error)
    const errorMsg = error.response?.data?.message || error.message || 'Failed to add category'
    alert('Error: ' + errorMsg)
  }
}

const resetExpenseForm = () => {
  newExpenseCategory.value = { name: '', parentId: '', icon: '' }
  showEmojiPicker.value = { ...showEmojiPicker.value, expense: false }
}

const addIncomeCategory = async () => {
  if (!newIncomeCategory.value.name || !newIncomeCategory.value.name.trim()) return
  try {
    const payload = {
      name: newIncomeCategory.value.name,
      icon: newIncomeCategory.value.icon || null,
      parentCategoryId: newIncomeCategory.value.parentId || null,
    }
    await categoriesStore.addIncomeCategory(payload)
    newIncomeCategory.value = { name: '', parentId: '', icon: '' }
    showIncomeCategoryForm.value = false
    showEmojiPicker.value = { ...showEmojiPicker.value, income: false }
    alert('Income category added successfully!')
  } catch (error) {
    console.error('Failed to add income category', error)
    const errorMsg = error.response?.data?.message || error.message || 'Failed to add category'
    alert('Error: ' + errorMsg)
  }
}

const addIncomeSubcategory = async (parentId) => {
  const input = subCategoryInputs.value[parentId] || { name: '', icon: '' }
  const name = (input.name || '').trim()
  if (!name) return
  try {
    const payload = {
      name,
      icon: input.icon || null,
      parentCategoryId: parentId,
    }
    await categoriesStore.addIncomeCategory(payload)
    cancelSubForm(parentId)
    alert('Income subcategory added successfully!')
  } catch (error) {
    console.error('Failed to add income subcategory', error)
    alert('Error: ' + (error.response?.data?.message || error.message))
  }
}

const deleteExpenseCategory = async (id) => {
  if (window.confirm('Delete this category?')) {
    try {
      await categoriesStore.deleteExpenseCategory(id)
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Failed to delete category', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete category'
      alert('Error: ' + errorMsg)
    }
  }
}

const deleteIncomeCategory = async (id) => {
  if (window.confirm('Delete this category?')) {
    try {
      await categoriesStore.deleteIncomeCategory(id)
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Failed to delete category', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete category'
      alert('Error: ' + errorMsg)
    }
  }
}

const enable2FA = () => {
  settings.value.twoFactorAuth = !settings.value.twoFactorAuth
}

const addAccountCategory = () => {
  if (!newAccountCategory.value.trim()) return
  if (accountCategories.value.includes(newAccountCategory.value)) {
    alert('This account type already exists!')
    return
  }
  accountCategories.value.push(newAccountCategory.value)
  newAccountCategory.value = ''
  showAccountCategoryForm.value = false
  saveAccountCategories()
}

const deleteAccountCategory = (idx) => {
  if (window.confirm('Delete this account type?')) {
    accountCategories.value.splice(idx, 1)
    saveAccountCategories()
  }
}

const saveAccountCategories = () => {
  localStorage.setItem('accountCategories', JSON.stringify(accountCategories.value))
}

const loadAccountCategories = () => {
  const saved = localStorage.getItem('accountCategories')
  if (saved) {
    accountCategories.value = JSON.parse(saved)
  } else {
    // Initialize with default account types
    accountCategories.value = ['Cash', 'Savings Account', 'Credit Card', 'Debit Card']
    saveAccountCategories()
  }
}

const fetchAccounts = async () => {
  try {
    loadingAccounts.value = true
    const response = await apiClient.get('/accounts')
    accounts.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load accounts', error)
  } finally {
    loadingAccounts.value = false
  }
}

const deleteAccount = async (id) => {
  if (!confirm('Delete this account?')) return
  await apiClient.delete(`/accounts/${id}`)
  fetchAccounts()
}

const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings.value))
  alert('Settings saved successfully!')
}

const resetSettings = () => {
  settings.value = {
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
  }
}

const exportData = () => {
  alert('Data export feature coming soon!')
}

const handleCreateAccount = async () => {
  try {
    if (!newAccount.value.name || !newAccount.value.accountType) {
      alert('Please fill in all required fields')
      return
    }

    const response = await apiClient.post('/accounts', {
      name: newAccount.value.name,
      accountType: newAccount.value.accountType,
      balance: newAccount.value.balance || 0,
      currency: newAccount.value.currency || 'INR',
    })
    
    if (response.data.success) {
      alert('Account created successfully! It will now appear in your Dashboard.')
      resetCreateAccountForm()
    }

    if (response.data.success) {
      alert('Account created successfully!')
      resetCreateAccountForm()
      fetchAccounts() // ✅ IMPORTANT Changes
    }
  } catch (error) {
    console.error('Failed to create account', error)
    alert('Failed to create account: ' + (error.response?.data?.message || error.message))
  }
}

const resetCreateAccountForm = () => {
  showCreateAccountForm.value = false
  newAccount.value = {
    name: '',
    accountType: '',
    balance: 0,
    currency: 'INR',
  }
}

const deleteUserAccount = () => {
  showDeleteAccountModal.value = true
  deleteAccountPassword.value = ''
}

const confirmDeleteAccount = async () => {
  if (!deleteAccountPassword.value) {
    alert('Please enter your password')
    return
  }

  try {
    const response = await apiClient.delete('/auth/account', {
      data: { password: deleteAccountPassword.value }
    })
    
    if (response.data.success) {
      alert('Account deleted successfully. You will be logged out.')
      // Clear local storage and auth data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // Redirect to login
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Failed to delete account', error)
    alert(error.response?.data?.message || 'Failed to delete account')
  }
}

const closeDeleteAccountModal = () => {
  showDeleteAccountModal.value = false
  deleteAccountPassword.value = ''
}

onMounted(() => {
  // Load dark mode preference
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDarkMode.value = savedTheme === 'dark'
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  }

  // Load saved settings
  const savedSettings = localStorage.getItem('appSettings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }

  // Load categories
  fetchCategories()
  
  // Load account categories
  loadAccountCategories()

  // Load Accounts
  fetchAccounts()
  
})
</script>