const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/env');
const logger = require('./utils/logger');
const db = require('./config/db');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://horizon-testnet.stellar.org', 'https://stellar.expert'],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Response compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parser
app.use(express.json({ limit: '100kb' }));

// HTTP logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Mount Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'CareCredits Analytics, Feedback & Admin API Server',
    status: 'online',
    healthCheck: '/api/health',
    analytics: '/api/analytics/recent',
    feedback: '/api/feedback/recent',
    adminDashboard: '/api/admin/dashboard',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

// Server Lifecycle & Graceful Shutdown
let server = null;

if (require.main === module) {
  server = app.listen(config.port, () => {
    const mem = process.memoryUsage();
    logger.info('🚀 CareCredits Backend Started [Port: %d, ENV: %s, Node: %s, Arch: %s, Memory: %dMB]',
      config.port,
      config.nodeEnv,
      process.version,
      process.arch,
      parseFloat((mem.rss / 1024 / 1024).toFixed(2))
    );
  });

  const gracefulShutdown = (signal) => {
    logger.info('Received %s signal. Initiating graceful shutdown...', signal);
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed. Draining database connection pool...');
        try {
          const pool = db.getPool();
          await pool.end();
          logger.info('Database pool drained. Shutdown complete.');
        } catch (err) {
          logger.error('Error during pool shutdown: %s', err.message);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION: %s\nStack: %s', err.message, err.stack);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('UNHANDLED PROMISE REJECTION: %s', reason instanceof Error ? reason.message : String(reason));
  });
}

module.exports = app;
