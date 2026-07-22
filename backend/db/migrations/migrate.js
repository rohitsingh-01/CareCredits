const fs = require('fs');
const path = require('path');
const db = require('../../config/db');
const logger = require('../../utils/logger');

async function runMigrations() {
  logger.info('Starting PostgreSQL database migrations...');
  try {
    const migrationFile = path.join(__dirname, '001_create_wallet_interactions.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    await db.query(sql, []);
    logger.info('Successfully executed migration: 001_create_wallet_interactions.sql');
  } catch (error) {
    logger.error('Migration failed: %s', error.message);
    process.exit(1);
  } finally {
    const pool = db.getPool();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
