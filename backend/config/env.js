const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/carecredits_db',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'carecredits2026',
  adminSecret: process.env.ADMIN_SECRET || 'carecredits-secret-admin-jwt-token-2026',
};

function validateConfig() {
  const isProd = config.nodeEnv === 'production';
  const errors = [];

  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push(`Invalid PORT number: ${process.env.PORT}`);
  }

  if (isProd) {
    if (!process.env.DATABASE_URL) {
      errors.push('CRITICAL: DATABASE_URL environment variable is required in production mode.');
    }
    if (!process.env.ADMIN_SECRET || process.env.ADMIN_SECRET === 'carecredits-secret-admin-jwt-token-2026') {
      errors.push('CRITICAL: Production ADMIN_SECRET must be explicitly set to a secure secret key.');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Environment Variable Validation Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (isProd) {
      console.error('🔥 Terminating backend due to invalid production configuration.');
      process.exit(1);
    }
  }
}

validateConfig();

module.exports = config;
