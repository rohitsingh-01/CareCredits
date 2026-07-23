const db = require('../config/db');
const config = require('../config/env');

async function getHealth(req, res, next) {
  try {
    const dbHealth = await db.checkHealthDetailed();
    const mem = process.memoryUsage();

    const dbConnected = dbHealth.connected;
    const status = dbConnected ? 'healthy' : 'degraded';

    return res.status(200).json({
      status,
      service: 'CareCredits Analytics API',
      version: '1.0.0',
      environment: config.nodeEnv,
      runningMode: dbConnected ? 'production_database' : 'resilient_fallback',
      healthScore: dbConnected ? 100 : 85,
      database: {
        connected: dbConnected,
        latencyMs: dbHealth.latencyMs,
        status: dbConnected ? 'connected' : 'fallback_mode',
        degradationMessage: dbConnected ? null : 'PostgreSQL unavailable. Operating in resilient fallback mode.',
      },
      uptime: Math.floor(process.uptime()),
      memory: {
        rssMb: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
        heapTotalMb: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(2)),
        heapUsedMb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
        externalMb: parseFloat((mem.external / 1024 / 1024).toFixed(2)),
      },
      nodeVersion: process.version,
      cpuArch: process.arch,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};
