const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserPreferences,
  updateUserPreferences,
} = require('../controllers/notificationPreferencesController');

// Get user's notification preferences
router.get('/', authenticate, getUserPreferences);

// Update user's notification preferences
router.put('/', authenticate, updateUserPreferences);

module.exports = router; 