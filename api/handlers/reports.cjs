const { query } = require('../lib/database.cjs');

function sanitizeDate(value) {
  return value ? value : null;
}

async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;
    console.log('[getDashboardSummary] Starting for userId:', userId);
    const { month = new Date().toISOString().substring(0, 7) } = req.query;
    console.log('[getDashboardSummary] Month:', month);

    const balanceResult = await query(
      'SELECT COALESCE(SUM(balance), 0) as total_balance FROM accounts WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    console.log('[getDashboardSummary] Balance query result:', balanceResult.rows[0]);

    const totalExpensesResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    console.log('[getDashboardSummary] Total expenses query result:', totalExpensesResult.rows[0]);

    const totalIncomeResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total_income FROM incomes WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    console.log('[getDashboardSummary] Total income query result:', totalIncomeResult.rows[0]);

    const currentExpensesResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as current_month_expenses FROM expenses
       WHERE user_id = $1 AND is_active = true
       AND TO_CHAR(expense_date, 'YYYY-MM') = $2`,
      [userId, month]
    );
    console.log('[getDashboardSummary] Current month expenses result:', currentExpensesResult.rows[0]);

    const currentIncomeResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as current_month_income FROM incomes
       WHERE user_id = $1 AND is_active = true
       AND TO_CHAR(income_date, 'YYYY-MM') = $2`,
      [userId, month]
    );
    console.log('[getDashboardSummary] Current month income result:', currentIncomeResult.rows[0]);

    const recentTransactions = await query(
      `SELECT e.id, 'expense' as type, e.amount, e.expense_date AS date, e.description,
              c.name as category, c.icon as category_icon
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.user_id = $1 AND e.is_active = true
       UNION ALL
       SELECT i.id, 'income' as type, i.amount, i.income_date AS date, i.description,
              c.name as category, c.icon as category_icon
       FROM incomes i
       LEFT JOIN income_categories c ON i.category_id = c.id
       WHERE i.user_id = $1 AND i.is_active = true
       UNION ALL
       SELECT t.id, 'transfer' as type, t.amount, t.transfer_date AS date, t.description,
              'Transfer' as category, NULL as category_icon
       FROM transfers t
       WHERE t.user_id = $1
       ORDER BY date DESC
       LIMIT 10`,
      [userId]
    );
    console.log('[getDashboardSummary] Recent transactions count:', recentTransactions.rows.length);

    res.json({
      success: true,
      data: {
        totalBalance: balanceResult.rows[0].total_balance,
        totalExpenses: totalExpensesResult.rows[0].total_expenses,
        totalIncome: totalIncomeResult.rows[0].total_income,
        currentMonthExpenses: currentExpensesResult.rows[0].current_month_expenses,
        currentMonthIncome: currentIncomeResult.rows[0].current_month_income,
        recentTransactions: recentTransactions.rows,
      },
    });
  } catch (error) {
    console.error('[getDashboardSummary] Error:', error.message);
    console.error('[getDashboardSummary] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message,
    });
  }
}

async function getCategoryReport(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    let params = [userId];
    let expenseFilter = '';
    let incomeFilter = '';
    let index = 2;

    if (startDate) {
      expenseFilter += ` AND e.expense_date >= $${index}`;
      incomeFilter += ` AND i.income_date >= $${index}`;
      params.push(startDate);
      index++;
    }
    if (endDate) {
      expenseFilter += ` AND e.expense_date <= $${index}`;
      incomeFilter += ` AND i.income_date <= $${index}`;
      params.push(endDate);
      index++;
    }

    const result = await query(
      `SELECT id, name, icon, color, 'expense' as type, COALESCE(total, 0) as total
       FROM (
         SELECT c.id, c.name, c.icon, c.color, SUM(e.amount) as total
         FROM expense_categories c
         LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = $1 AND e.is_active = true ${expenseFilter}
         WHERE c.user_id = $1 AND c.is_active = true
         GROUP BY c.id, c.name, c.icon, c.color
       ) as expense_categories
       UNION ALL
       SELECT id, name, icon, color, 'income' as type, COALESCE(total, 0) as total
       FROM (
         SELECT c.id, c.name, c.icon, c.color, SUM(i.amount) as total
         FROM income_categories c
         LEFT JOIN incomes i ON i.category_id = c.id AND i.user_id = $1 AND i.is_active = true ${incomeFilter}
         WHERE c.user_id = $1 AND c.is_active = true
         GROUP BY c.id, c.name, c.icon, c.color
       ) as income_categories
       ORDER BY total DESC`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get reports categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report categories',
    });
  }
}

async function getBudgetComparison(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    let whereClause = 'b.user_id = $1 AND b.is_active = true';
    const params = [userId];
    let index = 2;

    if (startDate) {
      whereClause += ` AND b.month >= $${index}`;
      params.push(startDate);
      index++;
    }
    if (endDate) {
      whereClause += ` AND b.month <= $${index}`;
      params.push(endDate);
      index++;
    }

    const result = await query(
      `SELECT b.id,
              c.name as category_name,
              TO_CHAR(b.month, 'YYYY-MM') as month,
              b.budget_amount,
              COALESCE(SUM(e.amount), 0) as spent,
              COALESCE(SUM(e.amount), 0) - b.budget_amount as variance,
              CASE
                WHEN COALESCE(SUM(e.amount), 0) > b.budget_amount THEN 'EXCEEDED'
                WHEN b.budget_amount > 0 AND COALESCE(SUM(e.amount), 0) / b.budget_amount >= 0.8 THEN 'NEAR_LIMIT'
                ELSE 'UNDER'
              END as status
       FROM budgets b
       LEFT JOIN expense_categories c ON c.id = b.category_id
       LEFT JOIN expenses e ON e.category_id = b.category_id
         AND e.user_id = b.user_id
         AND e.is_active = true
         AND TO_CHAR(e.expense_date, 'YYYY-MM') = TO_CHAR(b.month, 'YYYY-MM')
       WHERE ${whereClause}
       GROUP BY b.id, c.name, b.month, b.budget_amount
       ORDER BY b.month DESC, c.name ASC`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get budget comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget comparison',
    });
  }
}

async function getChartData(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, period = 'monthly', type } = req.query;
    let chartType = type;
    if (!chartType) {
      if (req.url && req.url.includes('/income')) chartType = 'income';
      else if (req.url && req.url.includes('/expenses')) chartType = 'expense';
    }
    chartType = chartType === 'income' ? 'income' : 'expense';
    const table = chartType === 'income' ? 'incomes' : 'expenses';
    const dateField = chartType === 'income' ? 'income_date' : 'expense_date';
    const alias = period === 'daily' ? 'date' : 'month';
    const format = period === 'daily' ? 'YYYY-MM-DD' : 'YYYY-MM';

    let whereClause = `user_id = $1 AND is_active = true`;
    const params = [userId];
    let index = 2;

    if (startDate) {
      whereClause += ` AND ${dateField} >= $${index}`;
      params.push(startDate);
      index++;
    }
    if (endDate) {
      whereClause += ` AND ${dateField} <= $${index}`;
      params.push(endDate);
      index++;
    }

    const result = await query(
      `SELECT TO_CHAR(${dateField}, '${format}') as ${alias}, COALESCE(SUM(amount), 0) as amount
       FROM ${table}
       WHERE ${whereClause}
       GROUP BY ${alias}
       ORDER BY ${alias} ASC`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
    });
  }
}

async function getMonthlyReport(req, res) {
  try {
    const userId = req.user.id;
    const { month = new Date().toISOString().substring(0, 7) } = req.query;

    const dailyData = await query(
      `SELECT DATE(expense_date) as date, SUM(amount) as daily_total
       FROM expenses
       WHERE user_id = $1 AND is_active = true
       AND TO_CHAR(expense_date, 'YYYY-MM') = $2
       GROUP BY DATE(expense_date)
       ORDER BY date ASC`,
      [userId, month]
    );

    const categoryData = await query(
      `SELECT c.name, SUM(e.amount) as total, COUNT(e.id) as count
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.user_id = $1 AND e.is_active = true
       AND TO_CHAR(e.expense_date, 'YYYY-MM') = $2
       GROUP BY c.name
       ORDER BY total DESC`,
      [userId, month]
    );

    res.json({
      success: true,
      data: {
        dailyBreakdown: dailyData.rows,
        categoryBreakdown: categoryData.rows,
      },
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly report',
    });
  }
}

async function getYearlyReport(req, res) {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = await query(
      `SELECT TO_CHAR(expense_date, 'YYYY-MM') as month, SUM(amount) as total
       FROM expenses
       WHERE user_id = $1 AND is_active = true
       AND EXTRACT(YEAR FROM expense_date) = $2
       GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
       ORDER BY month ASC`,
      [userId, year]
    );

    const categoryData = await query(
      `SELECT c.name, SUM(e.amount) as total, COUNT(e.id) as count
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.user_id = $1 AND e.is_active = true
       AND EXTRACT(YEAR FROM e.expense_date) = $2
       GROUP BY c.name
       ORDER BY total DESC`,
      [userId, year]
    );

    res.json({
      success: true,
      data: {
        monthlyBreakdown: monthlyData.rows,
        categoryBreakdown: categoryData.rows,
      },
    });
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch yearly report',
    });
  }
}

async function exportDataToCSV(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type = 'all' } = req.query;

    let whereClause = 'e.user_id = $1 AND e.is_active = true';
    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND e.expense_date >= $${paramIndex}::date`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND e.expense_date <= $${paramIndex}::date`;
      params.push(endDate);
      paramIndex++;
    }

    const result = await query(
      `SELECT e.id, e.description, e.amount, e.expense_date AS date, 
              c.name AS category, a.account_name AS account
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       LEFT JOIN accounts a ON e.account_id = a.id
       WHERE ${whereClause}
       ORDER BY e.expense_date DESC`,
      params
    );

    if (!result.rows || result.rows.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'No data to export',
      }));
      return;
    }

    // Generate CSV content
    const headers = ['Date', 'Description', 'Category', 'Account', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...result.rows.map(row => [
        new Date(row.date).toISOString().split('T')[0],
        `"${(row.description || '').replace(/"/g, '""')}"`,
        row.category || '',
        row.account || '',
        row.amount
      ].join(','))
    ].join('\n');

    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="export_${new Date().toISOString().split('T')[0]}.csv"`,
    });
    res.end(csvContent);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardSummary,
  getCategoryReport,
  getBudgetComparison,
  getChartData,
  getMonthlyReport,
  getYearlyReport,
  exportDataToCSV,
};
