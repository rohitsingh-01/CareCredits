const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/adminAuth');
const { analyticsRateLimiter } = require('../middleware/rateLimiter');

router.use(analyticsRateLimiter);

// Public Admin Login / Logout
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);

// Protected Admin Dashboard Routes
router.get('/dashboard', requireAdminAuth, adminController.getDashboard);
router.get('/analytics', requireAdminAuth, adminController.getAnalytics);
router.get('/feedback', requireAdminAuth, adminController.getFeedback);
router.get('/caregivers', requireAdminAuth, adminController.getCaregivers);
router.get('/pools', requireAdminAuth, adminController.getPools);

module.exports = router;
