const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');

async function getAllIncome(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, categoryId, accountId, page = 0, limit = 20 } = req.query;

    let whereClause = 'i.user_id = $1 AND i.is_active = true';
    let params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND i.income_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND i.income_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    if (categoryId) {
      whereClause += ` AND i.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    if (accountId) {
      whereClause += ` AND i.account_id = $${paramIndex}`;
      params.push(accountId);
      paramIndex++;
    }

    const offset = parseInt(page) * parseInt(limit);

    const result = await query(
      `SELECT i.id, i.user_id, i.account_id, i.category_id, i.amount, i.description, i.income_date, i.is_active, i.created_at,
              a.name as account_name, c.name as category_name, c.icon as category_icon
       FROM incomes i
       LEFT JOIN accounts a ON i.account_id = a.id
       LEFT JOIN income_categories c ON i.category_id = c.id
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
    console.error('Get income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income',
    });
  }
}

async function createIncome(req, res) {
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
      `INSERT INTO incomes (id, user_id, account_id, category_id, amount, description, income_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, user_id, account_id, category_id, amount, description, income_date, is_active, created_at`,
      [id, userId, accountId, categoryId, amount, description, date || new Date()]
    );

    // Update account balance
    await query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, accountId]
    );

    res.status(201).json({
      success: true,
      message: 'Income created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create income',
    });
  }
}

async function updateIncome(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { accountId, categoryId, amount, description, date } = req.body;

    // Get old income to adjust balance
    const oldIncome = await query(
      'SELECT amount, account_id FROM incomes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!oldIncome.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }

    const result = await query(
      `UPDATE incomes
       SET category_id = COALESCE($1, category_id),
           amount = COALESCE($2, amount),
           description = COALESCE($3, description),
           income_date = COALESCE($4, income_date),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, account_id, category_id, amount, description, income_date, is_active, created_at, updated_at`,
      [categoryId, amount, description, date, id, userId]
    );

    // Adjust account balance if amount changed
    if (amount !== undefined && amount !== oldIncome.rows[0].amount) {
      const difference = amount - oldIncome.rows[0].amount;
      await query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [difference, accountId || oldIncome.rows[0].account_id]
      );
    }

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update income',
    });
  }
}

async function deleteIncome(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const income = await query(
      'SELECT amount, account_id FROM incomes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!income.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }

    // Soft delete
    await query(
      'UPDATE incomes SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    // Restore account balance
    await query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [income.rows[0].amount, income.rows[0].account_id]
    );

    res.json({
      success: true,
      message: 'Income deleted successfully',
    });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete income',
    });
  }
}

module.exports = {
  getAllIncome,
  createIncome,
  updateIncome,
  deleteIncome,
};
