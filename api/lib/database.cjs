const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let pool = null;

function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL or SUPABASE_DB_URL environment variable is required');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 10, // Reduced for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout
      ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

async function query(text, params) {
  try {
    const client = await getPool().connect();
    try {
      console.log('[database] Executing query:', text.substring(0, 50) + '...');
      const result = await client.query(text, params);
      console.log('[database] Query successful, rows:', result.rows.length);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[database] Connection/Query error:', error.code, error.message);
    const dbUrl = process.env.DATABASE_URL;
    const host = dbUrl ? dbUrl.split('@')[1]?.split(':')[0] : 'unknown';
    console.error('[database] Attempting to connect to:', host);
    throw error;
  }
}

module.exports = {
  query,
  getPool,
};
