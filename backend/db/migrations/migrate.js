const fs = require('fs');
const path = require('path');
const db = require('../../config/db');
const logger = require('../../utils/logger');

async function runMigrations() {
  logger.info('Starting PostgreSQL database migrations...');
  try {
    const migrationFiles = [
      '001_create_wallet_interactions.sql',
      '002_create_feedback_submissions.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await db.query(sql, []);
      logger.info('Successfully executed migration: %s', file);
    }
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
