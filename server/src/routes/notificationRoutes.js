const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  clearAllUserNotifications,
} = require('../controllers/notificationController');

// Get all notifications for the current user
router.get('/', authenticateToken, getNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', authenticateToken, markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticateToken, markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', authenticateToken, deleteNotificationById);

// Clear all notifications
router.delete('/', authenticateToken, clearAllUserNotifications);

module.exports = router; 