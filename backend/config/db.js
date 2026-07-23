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
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      logger.warn('⚠️ SLOW QUERY detected (%d ms): %s', duration, text.replace(/\s+/g, ' ').slice(0, 150));
    }
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Database query error (%d ms): %s [Query: %s]', duration, error.message, text.replace(/\s+/g, ' ').slice(0, 150));
    throw error;
  }
}

async function checkHealthDetailed() {
  const start = Date.now();
  try {
    const res = await query('SELECT 1 AS alive', []);
    const latency = Date.now() - start;
    return {
      connected: res.rows.length > 0,
      latencyMs: latency,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error.message,
    };
  }
}

module.exports = {
  getPool,
  query,
  checkHealth: async () => (await checkHealthDetailed()).connected,
  checkHealthDetailed,
};
