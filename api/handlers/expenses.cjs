const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');
const { checkAndCreateAlerts } = require('./budgets.cjs');

async function getAllExpenses(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, categoryId, accountId, page = 0, limit = 20 } = req.query;

    let whereClause = 'e.user_id = $1 AND e.is_active = true';
    let params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND e.expense_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND e.expense_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    if (categoryId) {
      whereClause += ` AND e.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    if (accountId) {
      whereClause += ` AND e.account_id = $${paramIndex}`;
      params.push(accountId);
      paramIndex++;
    }

    const offset = parseInt(page) * parseInt(limit);

    const result = await query(
      `SELECT e.id, e.user_id, e.account_id, e.category_id, e.amount, e.description, e.expense_date, e.is_active, e.created_at,
              a.name as account_name, c.name as category_name, c.icon as category_icon
       FROM expenses e
       LEFT JOIN accounts a ON e.account_id = a.id
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE ${whereClause}
       ORDER BY e.expense_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM expenses e WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
    });
  }
}

async function getExpenseSummary(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let whereClause = 'e.user_id = $1 AND e.is_active = true';
    let params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND e.expense_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND e.expense_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const result = await query(
      `SELECT c.id, c.name, c.icon, c.color, SUM(e.amount) as total_amount, COUNT(e.id) as count
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE ${whereClause}
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total_amount DESC`,
      params
    );

    const totalResult = await query(
      `SELECT SUM(amount) as total FROM expenses e WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        byCategory: result.rows,
        total: totalResult.rows[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense summary',
    });
  }
}

async function createExpense(req, res) {
  try {
    const userId = req.user.id;
    const { accountId, categoryId, amount, description, date } = req.body;

    if (!accountId || !categoryId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Account, category, and amount are required',
      });
    }

    const id = uuidv4();
    const result = await query(
      `INSERT INTO expenses (id, user_id, account_id, category_id, amount, description, expense_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, user_id, account_id, category_id, amount, description, expense_date, is_active, created_at`,
      [id, userId, accountId, categoryId, amount, description, date || new Date()]
    );

    // Update account balance
    await query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, accountId]
    );

    // Generate budget alerts for the affected category and month
    await checkAndCreateAlerts(userId, categoryId, date || new Date());

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
    });
  }
}

async function updateExpense(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { accountId, categoryId, amount, description, date } = req.body;

    // Get old expense to adjust balance
    const oldExpense = await query(
      'SELECT amount, account_id FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!oldExpense.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const result = await query(
      `UPDATE expenses
       SET category_id = COALESCE($1, category_id),
           amount = COALESCE($2, amount),
           description = COALESCE($3, description),
           expense_date = COALESCE($4, expense_date),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, account_id, category_id, amount, description, expense_date, is_active, created_at, updated_at`,
      [categoryId, amount, description, date, id, userId]
    );

    // Adjust account balance if amount changed
    if (amount !== undefined && amount !== oldExpense.rows[0].amount) {
      const difference = oldExpense.rows[0].amount - amount;
      await query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [difference, accountId || oldExpense.rows[0].account_id]
      );
    }

    const finalCategoryId = categoryId || oldExpense.rows[0].category_id;
    const finalExpenseDate = date || oldExpense.rows[0].expense_date;

    // Generate budget alerts if the expense changed or category moved
    if (amount !== undefined || date !== undefined || categoryId !== undefined) {
      await checkAndCreateAlerts(userId, finalCategoryId, finalExpenseDate);
      if (categoryId && categoryId !== oldExpense.rows[0].category_id) {
        await checkAndCreateAlerts(userId, oldExpense.rows[0].category_id, finalExpenseDate);
      }
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
    });
  }
}

async function deleteExpense(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const expense = await query(
      'SELECT amount, account_id FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!expense.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Soft delete
    await query(
      'UPDATE expenses SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    // Restore account balance
    await query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [expense.rows[0].amount, expense.rows[0].account_id]
    );

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
    });
  }
}

module.exports = {
  getAllExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
};
