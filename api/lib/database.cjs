const { Pool } = require('pg');

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
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  getPool,
};
