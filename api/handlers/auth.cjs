const { comparePassword, generateAccessToken, generateRefreshToken, getUserByEmail, createUser, verifyRefreshToken, verifyAccessToken, hashPassword } = require('../lib/auth.cjs');
const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');

const defaultExpenseCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#e74c3c' },
  { name: 'Transportation', icon: '🚗', color: '#3498db' },
  { name: 'Shopping', icon: '🛍️', color: '#f39c12' },
  { name: 'Entertainment', icon: '🎬', color: '#9b59b6' },
  { name: 'Utilities', icon: '💡', color: '#1abc9c' },
  { name: 'Health & Fitness', icon: '💪', color: '#e91e63' },
  { name: 'Education', icon: '📚', color: '#2196f3' },
  { name: 'Travel', icon: '✈️', color: '#ff6f00' },
  { name: 'Subscriptions', icon: '📱', color: '#673ab7' },
  { name: 'Other', icon: '💸', color: '#757575' },
];

const defaultIncomeCategories = [
  { name: 'Salary', icon: '💼', color: '#4caf50' },
  { name: 'Freelance', icon: '💻', color: '#00bcd4' },
  { name: 'Bonus', icon: '🎁', color: '#ff9800' },
  { name: 'Investment', icon: '📈', color: '#8bc34a' },
  { name: 'Gifts', icon: '🎀', color: '#e91e63' },
  { name: 'Other', icon: '💰', color: '#607d8b' },
];

async function createDefaultCategories(userId) {
  for (const cat of defaultExpenseCategories) {
    const id = uuidv4();
    await query(
      'INSERT INTO expense_categories (id, user_id, name, icon, color, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, userId, cat.name, cat.icon, cat.color, true]
    );
  }

  for (const cat of defaultIncomeCategories) {
    const id = uuidv4();
    await query(
      'INSERT INTO income_categories (id, user_id, name, icon, color, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, userId, cat.name, cat.icon, cat.color, true]
    );
  }
}

async function createDefaultAccount(userId) {
  const id = uuidv4();
  await query(
    'INSERT INTO accounts (id, user_id, name, account_type, balance, currency, is_active) VALUES ($1, $2, $3, $4, $5, $6, TRUE)',
    [id, userId, 'Cash', 'Cash', 0, 'INR']
  );
}

async function signup(req, res) {
  try {
    const { email, password, firstName = '', lastName = '' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const nameRegex = /^[A-Za-z\s'\-]+$/;
    if (firstName && !nameRegex.test(firstName)) {
      return res.status(400).json({
        success: false,
        message: 'First name contains invalid characters',
      });
    }
    if (lastName && !nameRegex.test(lastName)) {
      return res.status(400).json({
        success: false,
        message: 'Last name contains invalid characters',
      });
    }
    if (firstName && firstName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'First name must be 50 characters or less',
      });
    }
    if (lastName && lastName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Last name must be 50 characters or less',
      });
    }

    const pwdRegex = /^(?=.{8,32}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8–32 characters and include uppercase, lowercase and a special character',
      });
    }

    if (firstName === lastName && firstName) {
      return res.status(400).json({
        success: false,
        message: 'First and last names must not be identical',
      });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await createUser(email, password, firstName, lastName);
    await createDefaultCategories(user.id);
    await createDefaultAccount(user.id);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed',
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled',
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = await verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT id, email, first_name, last_name, role, email_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    const nameRegex = /^[A-Za-z\s'\-]+$/;
    if (firstName && !nameRegex.test(firstName)) {
      return res.status(400).json({
        success: false,
        message: 'First name contains invalid characters',
      });
    }
    if (lastName && !nameRegex.test(lastName)) {
      return res.status(400).json({
        success: false,
        message: 'Last name contains invalid characters',
      });
    }

    const result = await query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name) WHERE id = $3 RETURNING id, email, first_name, last_name, role',
      [firstName, lastName, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, currentPassword, newPassword } = req.body;
    const passwordToCheck = oldPassword || currentPassword;

    if (!passwordToCheck || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (!user.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isOldPasswordValid = await comparePassword(oldPassword, user.rows[0].password_hash);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    const pwdRegex = /^(?=.{8,32}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;
    if (!pwdRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be 8–32 characters and include uppercase, lowercase and a special character',
      });
    }

    const newPasswordHash = hashPassword(newPassword);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;

    await query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
    await query('UPDATE accounts SET is_active = false WHERE user_id = $1', [userId]);
    await query('UPDATE expenses SET is_active = false WHERE user_id = $1', [userId]);
    await query('UPDATE incomes SET is_active = false WHERE user_id = $1', [userId]);

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
  signup,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
