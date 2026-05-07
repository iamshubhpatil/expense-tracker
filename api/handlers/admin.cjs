const { hashPassword } = require('../lib/auth.cjs');
const { query } = require('../lib/database.cjs');

async function getAllUsers(req, res) {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, role, email_verified, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
}

async function getUserDetails(req, res) {
  try {
    const { userId } = req.params;
    const userResult = await query(
      `SELECT id, email, first_name, last_name, role, email_verified, is_active, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const summaryResult = await query(
      `SELECT
         COALESCE((SELECT COUNT(*) FROM expenses WHERE user_id = $1 AND is_active = true), 0) as expenses_count,
         COALESCE((SELECT COUNT(*) FROM incomes WHERE user_id = $1 AND is_active = true), 0) as income_count,
         COALESCE((SELECT COUNT(*) FROM transfers WHERE user_id = $1), 0) as transfers_count,
         COALESCE((SELECT COUNT(*) FROM accounts WHERE user_id = $1 AND is_active = true), 0) as accounts_count
       `,
      [userId]
    );

    const recentExpenses = await query(
      `SELECT description, amount, expense_date as date, c.name as category_name
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.user_id = $1 AND e.is_active = true
       ORDER BY e.expense_date DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        ...userResult.rows[0],
        summary: {
          expensesCount: Number(summaryResult.rows[0].expenses_count),
          incomeCount: Number(summaryResult.rows[0].income_count),
          transfersCount: Number(summaryResult.rows[0].transfers_count),
          accountsCount: Number(summaryResult.rows[0].accounts_count),
        },
        expenses: recentExpenses.rows,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
    });
  }
}

async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (admin or user)',
      });
    }

    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
}

async function deactivateUser(req, res) {
  try {
    const { userId } = req.params;

    await query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
    });
  }
}

async function reactivateUser(req, res) {
  try {
    const { userId } = req.params;

    await query(
      'UPDATE users SET is_active = true WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'User reactivated successfully',
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user',
    });
  }
}

async function resetUserPassword(req, res) {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    const pwdRegex = /^(?=.{8,32}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;
    if (!pwdRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8–32 characters and include uppercase, lowercase and a special character',
      });
    }

    const passwordHash = hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user password',
    });
  }
}

async function getAllExpenses(req, res) {
  try {
    const { userId, page = 0, limit = 1000 } = req.query;

    let whereClause = 'e.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND e.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    const offset = parseInt(page) * parseInt(limit);

    const result = await query(
      `SELECT e.id, e.user_id, e.account_id, e.category_id, e.amount, e.description, e.expense_date, e.is_active, e.created_at,
              a.name as account_name, c.name as category_name, u.first_name, u.last_name, u.email as user_email
       FROM expenses e
       LEFT JOIN accounts a ON e.account_id = a.id
       LEFT JOIN expense_categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.user_id = u.id
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
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
    });
  }
}

async function getAllIncome(req, res) {
  try {
    const { userId, page = 0, limit = 1000 } = req.query;

    let whereClause = 'i.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND i.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    const offset = parseInt(page) * parseInt(limit);

    const result = await query(
      `SELECT i.id, i.user_id, i.account_id, i.category_id, i.amount, i.description, i.income_date, i.is_active, i.created_at,
              a.name as account_name, c.name as category_name, u.first_name, u.last_name, u.email as user_email
       FROM incomes i
       LEFT JOIN accounts a ON i.account_id = a.id
       LEFT JOIN income_categories c ON i.category_id = c.id
       LEFT JOIN users u ON i.user_id = u.id
       WHERE ${whereClause}
       ORDER BY i.income_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM incomes i WHERE ${whereClause}`,
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
    console.error('Get all income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income',
    });
  }
}

async function getAllTransfers(req, res) {
  try {
    const { page = 0, limit = 1000 } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    const result = await query(
      `SELECT t.id,
              t.user_id,
              t.from_account_id,
              t.to_account_id,
              t.amount,
              t.description,
              t.transfer_date,
              t.created_at,
              u.first_name,
              u.last_name,
              fa.name as from_account_name,
              ta.name as to_account_name
       FROM transfers t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN accounts fa ON t.from_account_id = fa.id
       LEFT JOIN accounts ta ON t.to_account_id = ta.id
       ORDER BY t.transfer_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM transfers', []);

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
    console.error('Get all transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transfers',
    });
  }
}

async function deleteExpense(req, res) {
  try {
    const { expenseId } = req.params;

    const expense = await query(
      'SELECT amount, account_id FROM expenses WHERE id = $1',
      [expenseId]
    );

    if (!expense.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await query(
      'UPDATE expenses SET is_active = false, updated_at = NOW() WHERE id = $1',
      [expenseId]
    );

    await query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [expense.rows[0].amount, expense.rows[0].account_id]
    );

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
}

async function getStats(req, res) {
  try {
    const usersResult = await query('SELECT COUNT(*) as total_users FROM users');
    const expensesCount = await query('SELECT COUNT(*) as total FROM expenses WHERE is_active = true');
    const incomeCount = await query('SELECT COUNT(*) as total FROM incomes WHERE is_active = true');
    const transfersCount = await query('SELECT COUNT(*) as total FROM transfers');
    const accountsCount = await query('SELECT COUNT(*) as total FROM accounts WHERE is_active = true');
    const expenseSum = await query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE is_active = true');
    const incomeSum = await query('SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE is_active = true');
    const transferSum = await query('SELECT COALESCE(SUM(amount), 0) as total FROM transfers');

    // Active users in last 30 days (users with recent transactions or recently created)
    const activeUsersResult = await query(`
      SELECT COUNT(DISTINCT u.id) as active
      FROM users u
      LEFT JOIN expenses e ON u.id = e.user_id AND e.expense_date >= CURRENT_DATE - INTERVAL '30 days' AND e.is_active = true
      LEFT JOIN incomes i ON u.id = i.user_id AND i.income_date >= CURRENT_DATE - INTERVAL '30 days' AND i.is_active = true
      WHERE u.is_active = true AND u.email_verified = true
      AND (e.id IS NOT NULL OR i.id IS NOT NULL OR u.created_at >= CURRENT_DATE - INTERVAL '30 days')
    `);

    res.json({
      success: true,
      data: {
        users: { 
          total: Number(usersResult.rows[0].total_users),
          activeInLastMonth: Number(activeUsersResult.rows[0].active)
        },
        transactions: {
          expenses: Number(expensesCount.rows[0].total),
          income: Number(incomeCount.rows[0].total),
          transfers: Number(transfersCount.rows[0].total),
        },
        amounts: {
          expenses: Number(expenseSum.rows[0].total),
          income: Number(incomeSum.rows[0].total),
          transfers: Number(transferSum.rows[0].total),
        },
        accounts: { total: Number(accountsCount.rows[0].total) },
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats',
    });
  }
}

module.exports = {
  getAllUsers,
  getUserDetails,
  getStats,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  deleteUser,
  getAllExpenses,
  getAllIncome,
  getAllTransfers,
  deleteExpense,
};
