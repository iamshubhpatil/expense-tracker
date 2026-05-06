const { authenticate } = require('./lib/middleware.cjs');
const authHandlers = require('./handlers/auth.cjs');
const accountsHandlers = require('./handlers/accounts.cjs');
const expensesHandlers = require('./handlers/expenses.cjs');
const categoriesHandlers = require('./handlers/categories.cjs');
const incomeHandlers = require('./handlers/income.cjs');
const budgetsHandlers = require('./handlers/budgets.cjs');
const transfersHandlers = require('./handlers/transfers.cjs');
const reportsHandlers = require('./handlers/reports.cjs');
const importHandlers = require('./handlers/import.cjs');
const adminHandlers = require('./handlers/admin.cjs');

// Admin middleware
async function authenticateAdmin(req, res, next) {
  await authenticate(req, res, async () => {
    if (req.user.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Admin access required',
      }));
      return;
    }
    await next();
  });
}

// Helper to parse URL
function parseUrl(url) {
  const [path, query] = url.split('?');
  return {
    path: path.replace(/\/$/, '') || '/',
    query: new URLSearchParams(query || ''),
  };
}

// Helper to build query object
function getQueryParams(searchParams) {
  const params = {};
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
}

// Helper to handle route matching
function matchRoute(pathname, pattern) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].substring(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

async function apiRouter(req, res) {
  try {
    const { path, query } = parseUrl(req.url);
    const queryParams = getQueryParams(query);
    const method = req.method.toUpperCase();

    // Attach query params to request
    req.query = queryParams;

    // Add response helpers
    res.json = (data, statusCode = 200) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };
    res.status = (code) => ({
      json: (data) => res.json(data, code),
    });

    // Parse body for POST/PUT/PATCH requests
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      await new Promise((resolve) => req.on('end', resolve));
      const trimmedBody = body.trim();
      if (trimmedBody) {
        try {
          req.body = JSON.parse(trimmedBody);
        } catch (parseError) {
          return res.status(400).json({ success: false, message: 'Invalid JSON body' });
        }
      } else {
        req.body = {};
      }
    }

    // Health check
    if (path === '/api/health' && method === 'GET') {
      return res.json({
        status: 'OK',
        message: 'API is running',
        timestamp: new Date().toISOString(),
      });
    }

    // Auth routes (public)
    if (path === '/api/auth/signup' && method === 'POST') {
      return authHandlers.signup(req, res);
    }
    if (path === '/api/auth/login' && method === 'POST') {
      return authHandlers.login(req, res);
    }
    if (path === '/api/auth/refresh-token' && method === 'POST') {
      return authHandlers.refreshToken(req, res);
    }

    // Auth routes (protected)
    if (path === '/api/auth/profile' && method === 'GET') {
      await authenticate(req, res, () => authHandlers.getProfile(req, res));
      return;
    }
    if (path === '/api/auth/profile' && method === 'PUT') {
      await authenticate(req, res, () => authHandlers.updateProfile(req, res));
      return;
    }
    if (path === '/api/auth/change-password' && method === 'PUT') {
      await authenticate(req, res, () => authHandlers.changePassword(req, res));
      return;
    }
    if (path === '/api/auth/account' && method === 'DELETE') {
      await authenticate(req, res, () => authHandlers.deleteAccount(req, res));
      return;
    }

    // All other routes require authentication
    // Accounts
    if (path === '/api/accounts' && method === 'GET') {
      await authenticate(req, res, () => accountsHandlers.getAllAccounts(req, res));
      return;
    }
    if (path === '/api/accounts' && method === 'POST') {
      await authenticate(req, res, () => accountsHandlers.createAccount(req, res));
      return;
    }

    const accountIdMatch = matchRoute(path, '/api/accounts/:id');
    if (accountIdMatch) {
      req.params = accountIdMatch;
      if (method === 'GET') {
        await authenticate(req, res, () => accountsHandlers.getAccount(req, res));
        return;
      }
      if (method === 'PUT') {
        await authenticate(req, res, () => accountsHandlers.updateAccount(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => accountsHandlers.deleteAccount(req, res));
        return;
      }
    }

    const accountBalanceMatch = matchRoute(path, '/api/accounts/:id/balance');
    if (accountBalanceMatch && method === 'GET') {
      req.params = accountBalanceMatch;
      await authenticate(req, res, () => accountsHandlers.getAccountBalance(req, res));
      return;
    }

    // Expenses
    if (path === '/api/expenses' && method === 'GET') {
      await authenticate(req, res, () => expensesHandlers.getAllExpenses(req, res));
      return;
    }
    if (path === '/api/expenses/summary' && method === 'GET') {
      await authenticate(req, res, () => expensesHandlers.getExpenseSummary(req, res));
      return;
    }
    if (path === '/api/expenses' && method === 'POST') {
      await authenticate(req, res, () => expensesHandlers.createExpense(req, res));
      return;
    }

    const expenseIdMatch = matchRoute(path, '/api/expenses/:id');
    if (expenseIdMatch) {
      req.params = expenseIdMatch;
      if (method === 'PUT') {
        await authenticate(req, res, () => expensesHandlers.updateExpense(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => expensesHandlers.deleteExpense(req, res));
        return;
      }
    }

    // Income Categories
    if (path === '/api/income-categories/hierarchy' && method === 'GET') {
      await authenticate(req, res, () => categoriesHandlers.getIncomeCategoriesHierarchy(req, res));
      return;
    }
    if (path === '/api/income-categories' && method === 'GET') {
      await authenticate(req, res, () => categoriesHandlers.getAllIncomeCategories(req, res));
      return;
    }
    if (path === '/api/income-categories' && method === 'POST') {
      await authenticate(req, res, () => categoriesHandlers.createIncomeCategory(req, res));
      return;
    }

    const incomeCatMatch = matchRoute(path, '/api/income-categories/:id');
    if (incomeCatMatch) {
      req.params = incomeCatMatch;
      if (method === 'PUT') {
        await authenticate(req, res, () => categoriesHandlers.updateIncomeCategory(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => categoriesHandlers.deleteIncomeCategory(req, res));
        return;
      }
    }

    // Expense Categories
    if (path === '/api/expense-categories/hierarchy' && method === 'GET') {
      await authenticate(req, res, () => categoriesHandlers.getExpenseCategoriesHierarchy(req, res));
      return;
    }
    if (path === '/api/expense-categories' && method === 'GET') {
      await authenticate(req, res, () => categoriesHandlers.getAllExpenseCategories(req, res));
      return;
    }
    if (path === '/api/expense-categories' && method === 'POST') {
      await authenticate(req, res, () => categoriesHandlers.createExpenseCategory(req, res));
      return;
    }

    const expenseCatMatch = matchRoute(path, '/api/expense-categories/:id');
    if (expenseCatMatch) {
      req.params = expenseCatMatch;
      if (method === 'PUT') {
        await authenticate(req, res, () => categoriesHandlers.updateExpenseCategory(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => categoriesHandlers.deleteExpenseCategory(req, res));
        return;
      }
    }

    // Income
    if (path === '/api/income' && method === 'GET') {
      await authenticate(req, res, () => incomeHandlers.getAllIncome(req, res));
      return;
    }
    if (path === '/api/income' && method === 'POST') {
      await authenticate(req, res, () => incomeHandlers.createIncome(req, res));
      return;
    }

    const incomeIdMatch = matchRoute(path, '/api/income/:id');
    if (incomeIdMatch) {
      req.params = incomeIdMatch;
      if (method === 'PUT') {
        await authenticate(req, res, () => incomeHandlers.updateIncome(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => incomeHandlers.deleteIncome(req, res));
        return;
      }
    }

    // Budgets
    if (path === '/api/budgets/summary' && method === 'GET') {
      await authenticate(req, res, () => budgetsHandlers.getBudgetSummary(req, res));
      return;
    }
    if (path === '/api/budgets/alerts/list' && method === 'GET') {
      await authenticate(req, res, () => budgetsHandlers.getBudgetAlerts(req, res));
      return;
    }
    if (path === '/api/budgets/alerts/mark-all/read' && method === 'PUT') {
      await authenticate(req, res, () => budgetsHandlers.markAllAlertsRead(req, res));
      return;
    }
    const budgetAlertReadMatch = matchRoute(path, '/api/budgets/alerts/:alertId/read');
    if (budgetAlertReadMatch && method === 'PUT') {
      req.params = budgetAlertReadMatch;
      await authenticate(req, res, () => budgetsHandlers.markAlertRead(req, res));
      return;
    }
    if (path === '/api/budgets' && method === 'GET') {
      await authenticate(req, res, () => budgetsHandlers.getAllBudgets(req, res));
      return;
    }
    if (path === '/api/budgets' && method === 'POST') {
      await authenticate(req, res, () => budgetsHandlers.createBudget(req, res));
      return;
    }

    const budgetIdMatch = matchRoute(path, '/api/budgets/:id');
    if (budgetIdMatch) {
      req.params = budgetIdMatch;
      if (method === 'PUT') {
        await authenticate(req, res, () => budgetsHandlers.updateBudget(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => budgetsHandlers.deleteBudget(req, res));
        return;
      }
    }

    // Transfers
    if (path === '/api/transfers' && method === 'GET') {
      await authenticate(req, res, () => transfersHandlers.getAllTransfers(req, res));
      return;
    }
    if (path === '/api/transfers' && method === 'POST') {
      await authenticate(req, res, () => transfersHandlers.createTransfer(req, res));
      return;
    }

    const transferIdMatch = matchRoute(path, '/api/transfers/:id');
    if (transferIdMatch) {
      req.params = transferIdMatch;
      if (method === 'PUT') {
        await authenticate(req, res, () => transfersHandlers.updateTransfer(req, res));
        return;
      }
      if (method === 'DELETE') {
        await authenticate(req, res, () => transfersHandlers.deleteTransfer(req, res));
        return;
      }
    }

    // Import
    if (path === '/api/import' && method === 'POST') {
      await authenticate(req, res, () => importHandlers.importAll(req, res));
      return;
    }

    // Reports
    if (path === '/api/reports/dashboard' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getDashboardSummary(req, res));
      return;
    }
    if (path === '/api/reports/overview' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getDashboardSummary(req, res));
      return;
    }
    if (path === '/api/reports/categories' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getCategoryReport(req, res));
      return;
    }
    if (path === '/api/reports/budgets/comparison' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getBudgetComparison(req, res));
      return;
    }
    if (path === '/api/reports/charts/income' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getChartData(req, res));
      return;
    }
    if (path === '/api/reports/charts/expenses' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getChartData(req, res));
      return;
    }
    if (path === '/api/reports/monthly' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getMonthlyReport(req, res));
      return;
    }
    if (path === '/api/reports/yearly' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.getYearlyReport(req, res));
      return;
    }
    if (path === '/api/reports/export/csv' && method === 'GET') {
      await authenticate(req, res, () => reportsHandlers.exportDataToCSV(req, res));
      return;
    }

    // Admin routes
    if (path === '/api/admin/users' && method === 'GET') {
      await authenticateAdmin(req, res, () => adminHandlers.getAllUsers(req, res));
      return;
    }

    const userDetailsMatch = matchRoute(path, '/api/admin/users/:userId');
    if (userDetailsMatch && method === 'GET') {
      req.params = userDetailsMatch;
      await authenticateAdmin(req, res, () => adminHandlers.getUserDetails(req, res));
      return;
    }

    const userRoleMatch = matchRoute(path, '/api/admin/users/:userId/role');
    if (userRoleMatch && method === 'PUT') {
      req.params = userRoleMatch;
      await authenticateAdmin(req, res, () => adminHandlers.updateUserRole(req, res));
      return;
    }

    const userDeactivateMatch = matchRoute(path, '/api/admin/users/:userId/deactivate');
    if (userDeactivateMatch && method === 'PUT') {
      req.params = userDeactivateMatch;
      await authenticateAdmin(req, res, () => adminHandlers.deactivateUser(req, res));
      return;
    }

    const userReactivateMatch = matchRoute(path, '/api/admin/users/:userId/reactivate');
    if (userReactivateMatch && method === 'PUT') {
      req.params = userReactivateMatch;
      await authenticateAdmin(req, res, () => adminHandlers.reactivateUser(req, res));
      return;
    }

    const userResetPasswordMatch = matchRoute(path, '/api/admin/users/:userId/reset-password');
    if (userResetPasswordMatch && method === 'PUT') {
      req.params = userResetPasswordMatch;
      await authenticateAdmin(req, res, () => adminHandlers.resetUserPassword(req, res));
      return;
    }

    const userDeleteMatch = matchRoute(path, '/api/admin/users/:userId');
    if (userDeleteMatch && method === 'DELETE') {
      req.params = userDeleteMatch;
      await authenticateAdmin(req, res, () => adminHandlers.deleteUser(req, res));
      return;
    }

    if (path === '/api/admin/stats' && method === 'GET') {
      await authenticateAdmin(req, res, () => adminHandlers.getStats(req, res));
      return;
    }

    if (path === '/api/admin/expenses' && method === 'GET') {
      await authenticateAdmin(req, res, () => adminHandlers.getAllExpenses(req, res));
      return;
    }

    if (path === '/api/admin/income' && method === 'GET') {
      await authenticateAdmin(req, res, () => adminHandlers.getAllIncome(req, res));
      return;
    }

    if (path === '/api/admin/transfers' && method === 'GET') {
      await authenticateAdmin(req, res, () => adminHandlers.getAllTransfers(req, res));
      return;
    }

    const adminExpenseMatch = matchRoute(path, '/api/admin/expenses/:expenseId');
    if (adminExpenseMatch && method === 'DELETE') {
      req.params = adminExpenseMatch;
      await authenticateAdmin(req, res, () => adminHandlers.deleteExpense(req, res));
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Not found',
    }));
  } catch (error) {
    console.error('API error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Internal server error',
    }));
  }
}

module.exports = apiRouter;
