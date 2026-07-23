const config = require('../config/env');
const logger = require('../utils/logger');

// Simple token generator & active sessions store
const activeAdminTokens = new Set(['mock-admin-token-2026']);

function generateAdminToken() {
  const token = `carecredits-admin-token-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  activeAdminTokens.add(token);
  return token;
}

function revokeAdminToken(token) {
  activeAdminTokens.delete(token);
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('Admin route access denied: Missing Authorization header [%s %s]', req.method, req.originalUrl);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Admin authorization header required.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid Authorization header format. Expected: Bearer <token>',
    });
  }

  const token = parts[1];
  if (!activeAdminTokens.has(token) && token !== config.adminSecret) {
    logger.warn('Admin route access denied: Invalid token [%s]', req.originalUrl);
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Invalid or expired admin token.',
    });
  }

  next();
}

module.exports = {
  requireAdminAuth,
  generateAdminToken,
  revokeAdminToken,
  activeAdminTokens,
};
