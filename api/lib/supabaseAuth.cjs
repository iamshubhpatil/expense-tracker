const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { query } = require('./database.cjs');
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
  try {
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
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
}

async function createDefaultAccount(userId) {
  try {
    const id = uuidv4();
    await query(
      'INSERT INTO accounts (id, user_id, name, account_type, balance, currency, is_active) VALUES ($1, $2, $3, $4, $5, $6, TRUE)',
      [id, userId, 'Cash', 'Cash', 0, 'INR']
    );
  } catch (error) {
    console.error('Error creating default account:', error);
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_API_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are required for server-side auth verification.');
}

async function verifySupabaseAccessToken(accessToken) {
  if (!accessToken || !SUPABASE_URL || !SUPABASE_API_KEY) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_API_KEY,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    console.error('Supabase token verification failed:', response.status, errorBody);
    return null;
  }

  const data = await response.json();
  return data.user || data;
}

async function ensureLocalUser(supabaseUser) {
  if (!supabaseUser?.id) {
    return null;
  }

  const userId = supabaseUser.id;
  console.log('[ensureLocalUser] Checking for existing user:', userId);
  
  let existing;
  try {
    existing = await query(
      'SELECT id, email, first_name, last_name, role, email_verified, is_active FROM users WHERE id = $1',
      [userId]
    );
    console.log('[ensureLocalUser] Query successful, found:', existing.rows.length, 'user(s)');
  } catch (error) {
    console.error('[ensureLocalUser] Database query failed:', error.message);
    console.error('[ensureLocalUser] Error code:', error.code);
    throw error;
  }

  if (existing.rows[0]) {
    const hasExpenseCategories = await query(
      'SELECT 1 FROM expense_categories WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    const hasIncomeCategories = await query(
      'SELECT 1 FROM income_categories WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    const hasAccounts = await query(
      'SELECT 1 FROM accounts WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (!hasExpenseCategories.rows.length || !hasIncomeCategories.rows.length) {
      await createDefaultCategories(userId);
    }
    if (!hasAccounts.rows.length) {
      await createDefaultAccount(userId);
    }

    return existing.rows[0];
  }

  const firstName = supabaseUser.user_metadata?.first_name || null;
  const lastName = supabaseUser.user_metadata?.last_name || null;
  const role = supabaseUser.user_metadata?.role || 'user';
  const emailVerified = !!supabaseUser.email_confirmed_at;

  const inserted = await query(
    'INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, role, email_verified, is_active',
    [userId, supabaseUser.email, '', firstName, lastName, role, emailVerified, true]
  );

  // Create default categories and account for new user
  await createDefaultCategories(userId);
  await createDefaultAccount(userId);

  return inserted.rows[0];
}

module.exports = {
  verifySupabaseAccessToken,
  ensureLocalUser,
};
