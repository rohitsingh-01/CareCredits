const db = require('../config/db');

async function getHealth(req, res, next) {
  try {
    const dbConnected = await db.checkHealth();
    const status = dbConnected ? 'healthy' : 'degraded';
    const statusCode = status === 'healthy' ? 200 : 200; // Return 200 with degraded state so status probes don't crash orchestrators

    return res.status(statusCode).json({
      status,
      service: 'CareCredits Analytics API',
      version: '1.0.0',
      dbConnected,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};
