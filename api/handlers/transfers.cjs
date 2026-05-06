const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');

async function getAllTransfers(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, page = 0, limit = 20 } = req.query;

    let whereClause = 't.user_id = $1';
    let params = [userId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND t.transfer_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND t.transfer_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const offset = parseInt(page) * parseInt(limit);

    const result = await query(
      `SELECT id, user_id, from_account_id, to_account_id, amount, description, transfer_date, created_at
       FROM transfers t
       WHERE ${whereClause}
       ORDER BY transfer_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM transfers t WHERE ${whereClause}`,
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
    console.error('Get transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transfers',
    });
  }
}

async function createTransfer(req, res) {
  try {
    const userId = req.user.id;
    const { fromAccountId, toAccountId, amount, description, date } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'From account, to account, and amount are required',
      });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same account',
      });
    }

    // Verify both accounts belong to user
    const accounts = await query(
      'SELECT id FROM accounts WHERE user_id = $1 AND (id = $2 OR id = $3)',
      [userId, fromAccountId, toAccountId]
    );

    if (accounts.rows.length !== 2) {
      return res.status(404).json({
        success: false,
        message: 'One or both accounts not found',
      });
    }

    const id = uuidv4();
    const result = await query(
      `INSERT INTO transfers (id, user_id, from_account_id, to_account_id, amount, description, transfer_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, from_account_id, to_account_id, amount, description, transfer_date, created_at`,
      [id, userId, fromAccountId, toAccountId, amount, description, date || new Date()]
    );

    // Update account balances
    await query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromAccountId]
    );
    await query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccountId]
    );

    res.status(201).json({
      success: true,
      message: 'Transfer created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transfer',
    });
  }
}

async function updateTransfer(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, description, date } = req.body;

    // Get old transfer
    const oldTransfer = await query(
      'SELECT amount, from_account_id, to_account_id FROM transfers WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!oldTransfer.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    const result = await query(
      `UPDATE transfers
       SET amount = COALESCE($1, amount),
           description = COALESCE($2, description),
           transfer_date = COALESCE($3, transfer_date),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, from_account_id, to_account_id, amount, description, transfer_date, created_at, updated_at`,
      [amount, description, date, id, userId]
    );

    // Adjust account balance if amount changed
    if (amount !== undefined && amount !== oldTransfer.rows[0].amount) {
      const difference = amount - oldTransfer.rows[0].amount;
      await query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [difference, oldTransfer.rows[0].from_account_id]
      );
      await query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [difference, oldTransfer.rows[0].to_account_id]
      );
    }

    res.json({
      success: true,
      message: 'Transfer updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transfer',
    });
  }
}

async function deleteTransfer(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transfer = await query(
      'SELECT amount, from_account_id, to_account_id FROM transfers WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!transfer.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    // Delete transfer record
    await query(
      'DELETE FROM transfers WHERE id = $1',
      [id]
    );

    // Restore account balances
    await query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [transfer.rows[0].amount, transfer.rows[0].from_account_id]
    );
    await query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [transfer.rows[0].amount, transfer.rows[0].to_account_id]
    );

    res.json({
      success: true,
      message: 'Transfer deleted successfully',
    });
  } catch (error) {
    console.error('Delete transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transfer',
    });
  }
}

module.exports = {
  getAllTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
};
