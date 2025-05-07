const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and manager/admin role
// router.use(authenticate, authorize(['ADMIN', 'MANAGER']));

// Routes
router.get('/projects/:projectId/stats', analyticsController.getProjectStats);
router.get('/users/:userId/metrics', analyticsController.getUserMetrics);
router.get('/teams/:teamId/metrics', analyticsController.getTeamMetrics);

module.exports = router; 