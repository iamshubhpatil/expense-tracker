const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');

async function getAllAccounts(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, user_id, name, account_type, balance, currency, is_active, created_at, updated_at 
       FROM accounts 
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts',
    });
  }
}

async function getAccount(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'SELECT id, user_id, name, account_type, balance, currency, is_active, created_at, updated_at FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account',
    });
  }
}

async function getAccountBalance(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, balance, currency FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    res.json({
      success: true,
      data: {
        accountId: result.rows[0].id,
        accountName: result.rows[0].name,
        balance: result.rows[0].balance,
        currency: result.rows[0].currency,
      },
    });
  } catch (error) {
    console.error('Get account balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account balance',
    });
  }
}

async function createAccount(req, res) {
  try {
    const userId = req.user.id;
    const { name, accountType, balance = 0, currency = 'INR' } = req.body;

    if (!name || !accountType) {
      return res.status(400).json({
        success: false,
        message: 'Account name and type are required',
      });
    }

    const id = uuidv4();
    const result = await query(
      `INSERT INTO accounts (id, user_id, name, account_type, balance, currency, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, user_id, name, account_type, balance, currency, is_active, created_at`,
      [id, userId, name, accountType, balance, currency]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
    });
  }
}

async function updateAccount(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, accountType, balance, currency } = req.body;

    const result = await query(
      `UPDATE accounts 
       SET name = COALESCE($1, name), 
           account_type = COALESCE($2, account_type),
           balance = COALESCE($3, balance),
           currency = COALESCE($4, currency),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, name, account_type, balance, currency, is_active, created_at, updated_at`,
      [name, accountType, balance, currency, id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account',
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if account exists
    const accountCheck = await query(
      'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!accountCheck.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Soft delete by setting is_active to false
    await query(
      'UPDATE accounts SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
}

module.exports = {
  getAllAccounts,
  getAccount,
  getAccountBalance,
  createAccount,
  updateAccount,
  deleteAccount,
};
