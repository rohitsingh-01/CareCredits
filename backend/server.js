const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const logger = require('./utils/logger');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request body parser
app.use(express.json({ limit: '100kb' }));

// HTTP logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Mount Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', healthRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'CareCredits Analytics & Feedback API Server',
    status: 'online',
    healthCheck: '/api/health',
    analytics: '/api/analytics/recent',
    feedback: '/api/feedback/recent',
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

// Start Server
if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`CareCredits Analytics Backend running on port ${config.port} [ENV: ${config.nodeEnv}]`);
  });
}

module.exports = app;
