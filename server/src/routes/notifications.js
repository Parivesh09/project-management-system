const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Routes
router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.markNotificationAsRead);
router.patch('/read-all', authenticate, notificationController.markAllNotificationsAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotificationById);

module.exports = router; 