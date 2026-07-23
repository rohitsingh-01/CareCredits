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

module.exports = config;
