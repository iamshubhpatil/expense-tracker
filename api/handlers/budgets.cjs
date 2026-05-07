const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');

async function getAllBudgets(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let whereClause = 'b.user_id = $1 AND b.is_active = true';
    const params = [userId];
    let paramIndex = 2;

    if (month) {
      whereClause += ` AND TO_CHAR(b.month, 'YYYY-MM') = $${paramIndex}`;
      params.push(month);
      paramIndex++;
    }

    const result = await query(
      `SELECT b.id,
              b.user_id,
              b.category_id,
              b.month,
              b.budget_amount,
              b.alert_threshold,
              COALESCE(SUM(e.amount), 0) AS current_spending,
              CASE
                WHEN b.budget_amount = 0 THEN 0
                ELSE COALESCE(SUM(e.amount), 0) * 100.0 / b.budget_amount
              END AS percentage_used,
              c.name AS category_name,
              c.icon AS category_icon,
              b.is_active,
              b.created_at,
              b.updated_at
       FROM budgets b
       LEFT JOIN expense_categories c ON c.id = b.category_id
       LEFT JOIN expenses e ON e.category_id = b.category_id
         AND e.user_id = b.user_id
         AND e.is_active = true
         AND TO_CHAR(e.expense_date, 'YYYY-MM') = TO_CHAR(b.month, 'YYYY-MM')
       WHERE ${whereClause}
       GROUP BY b.id, c.name, c.icon
       ORDER BY b.month DESC`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
    });
  }
}

async function getBudgetSummary(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let budgetWhereClause = 'user_id = $1 AND is_active = true';
    const budgetParams = [userId];
    let budgetParamIndex = 2;

    if (month) {
      budgetWhereClause += ` AND TO_CHAR(month, 'YYYY-MM') = $${budgetParamIndex}`;
      budgetParams.push(month);
      budgetParamIndex++;
    }

    const budgetSummaryResult = await query(
      `SELECT
         COUNT(*) AS total_budgets,
         COALESCE(SUM(budget_amount), 0) AS total_budget_amount
       FROM budgets
       WHERE ${budgetWhereClause}`,
      budgetParams
    );

    // Get count of budgets with exceeded status (percentage > 100)
    const exceededResult = await query(
      `SELECT COUNT(DISTINCT ba.budget_id) AS exceeded_count
       FROM budget_alerts ba
       JOIN budgets b ON b.id = ba.budget_id
       WHERE ba.user_id = $1
         AND ba.alert_type = 'EXCEEDED'
         AND ba.is_read = false
         AND b.is_active = true${month ? ` AND TO_CHAR(b.month, 'YYYY-MM') = $2` : ''}`,
      month ? [userId, month] : [userId]
    );

    // Get count of budgets with warning status (percentage >= threshold but <= 100)
    const warningResult = await query(
      `SELECT COUNT(DISTINCT ba.budget_id) AS warning_count
       FROM budget_alerts ba
       JOIN budgets b ON b.id = ba.budget_id
       WHERE ba.user_id = $1
         AND ba.alert_type = 'WARNING'
         AND ba.is_read = false
         AND b.is_active = true${month ? ` AND TO_CHAR(b.month, 'YYYY-MM') = $2` : ''}`,
      month ? [userId, month] : [userId]
    );

    // Get total spending tied to active budgets so it compares correctly with total budget amount.
    const spendingResult = await query(
      `WITH budget_spending AS (
         SELECT b.id AS budget_id,
                COALESCE(SUM(e.amount), 0) AS current_spending
         FROM budgets b
         LEFT JOIN expenses e ON e.user_id = b.user_id
           AND e.category_id = b.category_id
           AND e.is_active = true
           AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', b.month::timestamp)
         WHERE b.user_id = $1
           AND b.is_active = true${month ? ` AND TO_CHAR(b.month, 'YYYY-MM') = $2` : ''}
         GROUP BY b.id
       )
       SELECT COALESCE(SUM(current_spending), 0) AS total_spending
       FROM budget_spending`,
      month ? [userId, month] : [userId]
    );

    res.json({
      success: true,
      data: {
        total_budgets: Number(budgetSummaryResult.rows[0].total_budgets),
        total_budget_amount: Number(budgetSummaryResult.rows[0].total_budget_amount),
        total_spending: Number(spendingResult.rows[0].total_spending),
        warning_count: Number(warningResult.rows[0].warning_count),
        exceeded_count: Number(exceededResult.rows[0].exceeded_count),
      },
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget summary',
    });
  }
}

async function checkAndCreateAlerts(userId, categoryId, expenseDate) {
  try {
    const result = await query(
      `SELECT b.id,
              b.budget_amount,
              b.alert_threshold,
              COALESCE(SUM(e.amount), 0) AS current_spending
       FROM budgets b
       LEFT JOIN expenses e ON e.category_id = b.category_id
         AND e.user_id = b.user_id
         AND e.is_active = true
         AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', $3::timestamp)
       WHERE b.user_id = $1
         AND b.category_id = $2
         AND DATE_TRUNC('month', b.month::timestamp) = DATE_TRUNC('month', $3::timestamp)
       GROUP BY b.id, b.budget_amount, b.alert_threshold`,
      [userId, categoryId, expenseDate]
    );

    if (result.rows.length === 0) {
      return;
    }

    const budget = result.rows[0];
    const budgetAmount = Number(budget.budget_amount) || 0;
    if (budgetAmount <= 0) {
      return;
    }

    const percentageUsed = (Number(budget.current_spending) || 0) * 100.0 / budgetAmount;
    if (percentageUsed < Number(budget.alert_threshold || 0)) {
      return;
    }

    const alertType = percentageUsed > 100 ? 'EXCEEDED' : 'WARNING';

    const existingAlert = await query(
      `SELECT id FROM budget_alerts
       WHERE budget_id = $1 AND is_read = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [budget.id]
    );

    if (existingAlert.rows.length > 0) {
      return;
    }

    await query(
      `INSERT INTO budget_alerts (id, user_id, budget_id, alert_type, current_spending, budget_amount, percentage_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), userId, budget.id, alertType, budget.current_spending, budget.budget_amount, percentageUsed]
    );
  } catch (error) {
    console.error('Budget alert generation error:', error);
  }
}

async function getBudgetAlerts(req, res) {
  try {
    const userId = req.user.id;
    const { isRead } = req.query;
    let whereClause = 'a.user_id = $1';
    const params = [userId];

    if (isRead !== undefined) {
      whereClause += ` AND a.is_read = $2`;
      params.push(isRead === 'true');
    }

    const result = await query(
      `SELECT a.id,
              a.budget_id,
              a.alert_type,
              a.current_spending,
              a.budget_amount,
              a.percentage_used,
              a.is_read,
              a.created_at,
              c.name AS category_name
       FROM budget_alerts a
       LEFT JOIN budgets b ON b.id = a.budget_id
       LEFT JOIN expense_categories c ON c.id = b.category_id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget alerts',
    });
  }
}

async function markAlertRead(req, res) {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;
    console.log('[markAlertRead] Input:', { userId, alertId });

    const updateResult = await query(
      'UPDATE budget_alerts SET is_read = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
      [alertId, userId]
    );

    if (updateResult.rows.length === 0) {
      console.log('[markAlertRead] Alert not found');
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    console.log('[markAlertRead] Alert marked as read successfully');
    res.json({
      success: true,
      message: 'Alert marked as read',
    });
  } catch (error) {
    console.error('[markAlertRead] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message,
    });
  }
}

async function markAllAlertsRead(req, res) {
  try {
    const userId = req.user.id;
    console.log('[markAllAlertsRead] Starting for user:', userId);

    const updateResult = await query(
      'UPDATE budget_alerts SET is_read = true, updated_at = NOW() WHERE user_id = $1 RETURNING id',
      [userId]
    );

    console.log('[markAllAlertsRead] Updated', updateResult.rows.length, 'alerts');
    res.json({
      success: true,
      message: 'All alerts marked as read',
    });
  } catch (error) {
    console.error('[markAllAlertsRead] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alerts as read',
      error: error.message,
    });
  }
}

async function createBudget(req, res) {
  try {
    const userId = req.user.id;
    const { categoryId, month, budgetAmount, alertThreshold } = req.body;
    console.log('[createBudget] Input:', { userId, categoryId, month, budgetAmount, alertThreshold });

    if (!categoryId || !month || !budgetAmount) {
      return res.status(400).json({
        success: false,
        message: 'Category, month, and budget amount are required',
      });
    }

    const id = uuidv4();
    console.log('[createBudget] Generated ID:', id);

    const monthDate = month ? new Date(`${month}-01`) : null;
    if (!monthDate || Number.isNaN(monthDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Month must be in YYYY-MM format.',
      });
    }

    const formattedMonth = monthDate.toISOString().split('T')[0];
    console.log('[createBudget] Month date:', formattedMonth);

    const result = await query(
      `INSERT INTO budgets (id, user_id, category_id, month, budget_amount, alert_threshold, is_active)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 80.0), true)
       RETURNING id, user_id, category_id, month, budget_amount, alert_threshold, is_active, created_at`,
      [id, userId, categoryId, formattedMonth, budgetAmount, alertThreshold]
    );

    console.log('[createBudget] Insert successful:', result.rows[0]);

    await checkAndCreateAlerts(userId, categoryId, monthDate);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[createBudget] Error:', error.message);
    console.error('[createBudget] Stack:', error.stack);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A budget for that category and month already exists.',
        error: error.message,
      });
    }

    if (error.message && error.message.includes('invalid input syntax for type date')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Please use YYYY-MM.',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message,
    });
  }
}

async function updateBudget(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { budgetAmount, alertThreshold } = req.body;

    const result = await query(
      `UPDATE budgets
       SET budget_amount = COALESCE($1, budget_amount),
           alert_threshold = COALESCE($2, alert_threshold),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, category_id, month, budget_amount, alert_threshold, is_active, created_at, updated_at`,
      [budgetAmount, alertThreshold, id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await checkAndCreateAlerts(userId, result.rows[0].category_id, result.rows[0].month);

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
    });
  }
}

async function deleteBudget(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await query(
      'UPDATE budgets SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget',
    });
  }
}

module.exports = {
  getAllBudgets,
  getBudgetSummary,
  getBudgetAlerts,
  markAlertRead,
  markAllAlertsRead,
  createBudget,
  updateBudget,
  deleteBudget,
  checkAndCreateAlerts,
};
