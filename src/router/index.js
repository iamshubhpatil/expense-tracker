import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import LandingView from '@/views/LandingView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import ExpensesView from '@/views/expenses/ExpensesView.vue'
import IncomeView from '@/views/income/IncomeView.vue'
import TransfersView from '@/views/transfers/TransfersView.vue'
import ReportsView from '@/views/reports/ReportsView.vue'
import BudgetsView from '@/views/budgets/BudgetsView.vue'
import ProfileView from '@/views/profile/ProfileView.vue'
import SettingsView from '@/views/settings/SettingsView.vue'
import ImportView from '@/views/import/ImportView.vue'
import AdminView from '@/views/admin/AdminView.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
    meta: { requiresAuth: false }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmailView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: ExpensesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/income',
    name: 'Income',
    component: IncomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/transfers',
    name: 'Transfers',
    component: TransfersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/budgets',
    name: 'Budgets',
    component: BudgetsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/import',
    name: 'Import',
    component: ImportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if needed and wait for stored session to load
  if (!authStore.isHydrated) {
    await authStore.initializeAuth()
  }

  // Redirect authenticated users away from Landing, Login, Signup
  if (authStore.isAuthenticated) {
    if (to.name === 'Landing' || to.name === 'Login' || to.name === 'Signup') {
      next('/dashboard')
      return
    }
  }

  // Redirect to login if trying to access protected route while not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Redirect to dashboard if not admin trying to access admin
  if (to.meta.requiresAdmin && authStore.userRole !== 'admin') {
    next('/dashboard')
    return
  }

  next()
})

export default router
