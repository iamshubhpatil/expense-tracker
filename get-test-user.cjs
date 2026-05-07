/**
 * Helper to get a valid user ID from the database for testing
 * 
 * Usage:
 *   node get-test-user.cjs
 */

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

async function getTestUser() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('📍 Connecting to database...\n');

    // Get a user with expenses
    const result = await pool.query(`
      SELECT u.id, u.email, 
             COUNT(e.id) as expense_count,
             COUNT(i.id) as income_count
      FROM users u
      LEFT JOIN expenses e ON u.id = e.user_id AND e.is_active = true
      LEFT JOIN incomes i ON u.id = i.user_id AND i.is_active = true
      WHERE u.is_active = true
      GROUP BY u.id, u.email
      ORDER BY (COUNT(e.id) + COUNT(i.id)) DESC
      LIMIT 5
    `);

    if (result.rows.length === 0) {
      console.error('❌ No active users found in database\n');
      process.exit(1);
    }

    console.log('👥 Top users with transaction data:\n');
    result.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Expenses: ${user.expense_count}, Income: ${user.income_count}\n`);
    });

    const testUser = result.rows[0];
    console.log(`✅ Recommended test user: ${testUser.id}\n`);
    console.log(`🔧 Run this to test the export:\n`);
    console.log(`   node test-export.cjs ${testUser.id}\n`);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

getTestUser();
