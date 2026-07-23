const config = require('../config/env');
const logger = require('../utils/logger');
const { generateAdminToken, revokeAdminToken } = require('../middleware/adminAuth');
const adminService = require('../services/adminService');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.',
    });
  }

  if (username !== config.adminUsername || password !== config.adminPassword) {
    logger.warn('Failed admin login attempt [Username: %s]', username);
    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials.',
    });
  }

  const token = generateAdminToken();
  logger.info('Admin login successful [User: %s]', username);
  return res.status(200).json({
    success: true,
    message: 'Admin authentication successful.',
    token,
    user: { username, role: 'administrator' },
  });
}

async function logout(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    revokeAdminToken(token);
  }
  return res.status(200).json({
    success: true,
    message: 'Admin session logged out successfully.',
  });
}

async function getDashboard(req, res, next) {
  try {
    const summary = await adminService.getDashboardSummary();
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const timeSeries = await adminService.getAnalyticsTimeSeries();
    return res.status(200).json({
      success: true,
      data: timeSeries,
    });
  } catch (error) {
    next(error);
  }
}

async function getFeedback(req, res, next) {
  try {
    const { category, minRating, search, limit } = req.query;
    const records = await adminService.getAdminFeedback({ category, minRating, search, limit });
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

async function getCaregivers(req, res, next) {
  try {
    const caregivers = await adminService.getAdminCaregivers();
    return res.status(200).json({
      success: true,
      count: caregivers.length,
      data: caregivers,
    });
  } catch (error) {
    next(error);
  }
}

async function getPools(req, res, next) {
  try {
    const pools = await adminService.getAdminPools();
    return res.status(200).json({
      success: true,
      count: pools.length,
      data: pools,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout,
  getDashboard,
  getAnalytics,
  getFeedback,
  getCaregivers,
  getPools,
};
