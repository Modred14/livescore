// src/lib/db.js

/**
 * PostgreSQL connection helper using the Neon serverless driver.
 *
 * Usage (in any server-side file, API route, or Server Component):
 *
 *   import { query, getClient } from '@/lib/db';
 *
 *   // Simple query
 *   const { rows } = await query('SELECT * FROM tournaments WHERE id = $1', [id]);
 *
 *   // Transaction with a pooled client
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     ...
 *     await client.query('COMMIT');
 *   } catch (err) {
 *     await client.query('ROLLBACK');
 *     throw err;
 *   } finally {
 *     client.release();
 *   }
 */

import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error(
    '[db] DATABASE_URL is not set. Add it to your .env.local file.\n' +
    'Example: DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require'
  );
}

// ── Singleton pool ───────────────────────────────────────────────────────────
// Next.js hot-reload in development can cause multiple pool instances.
// We store the pool on the global object to avoid connection exhaustion.
let pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
    max: 10,                            // Max connections in pool
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
} else {
  // In dev, reuse the pool across hot reloads
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  pool = global._pgPool;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Run a parameterised query and return the result.
 * @param {string}  text   - SQL query string with $1, $2 … placeholders.
 * @param {Array}   params - Query parameters (optional).
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV !== 'production') {
      const duration = Date.now() - start;
      console.log('[db] query', { text: text.slice(0, 80), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('[db] query error', { text: text.slice(0, 80), error: error.message });
    throw error;
  }
}

/**
 * Acquire a pooled client for multi-statement transactions.
 * Always call client.release() in a finally block.
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Test the database connection. Useful on startup or in health-check routes.
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const { rows } = await query('SELECT NOW() AS now');
    console.log('[db] Connected to PostgreSQL at', rows[0].now);
    return true;
  } catch (error) {
    console.error('[db] Connection failed:', error.message);
    return false;
  }
}

export default pool;