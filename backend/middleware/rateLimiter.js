const rateLimit = require('express-rate-limit');

const analyticsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many analytics events submitted from this IP. Please try again later.',
  },
});

const healthRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 health requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many health checks requested.',
  },
});

module.exports = {
  analyticsRateLimiter,
  healthRateLimiter,
};
