const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

let pool = null;
let isConnected = false;

function getPool() {
  if (!pool) {
    const isProduction = config.nodeEnv === 'production';
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('connect', () => {
      isConnected = true;
      logger.info('PostgreSQL client connected to pool.');
    });

    pool.on('error', (err) => {
      isConnected = false;
      logger.error('Unexpected PostgreSQL pool error: %s', err.message);
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  try {
    const res = await p.query(text, params);
    return res;
  } catch (error) {
    logger.error('Database query error: %s [Query: %s]', error.message, text);
    throw error;
  }
}

async function checkHealth() {
  try {
    const res = await query('SELECT 1 AS alive', []);
    return res.rows.length > 0;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getPool,
  query,
  checkHealth,
};
