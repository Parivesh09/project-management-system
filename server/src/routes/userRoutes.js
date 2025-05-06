const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Validation middleware
const userValidation = [
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('username').optional().notEmpty().withMessage('Username cannot be empty'),
  body('role').optional().isIn(['USER', 'ADMIN', 'MANAGER']).withMessage('Invalid role'),
];

const profileValidation = [
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('username').optional().notEmpty().withMessage('Username cannot be empty'),
  body('currentPassword')
    .if(body('newPassword').exists())
    .notEmpty()
    .withMessage('Current password is required when changing password'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Routes
router.get('/', authenticate, userController.getUsers);

// Get current user
router.get('/me', authenticate, userController.getCurrentUser);

// Update user settings
router.put('/settings', authenticate, userController.updateUserSettings);

// Update user's profile
router.put('/profile/update', authenticate, profileValidation, userController.updateProfile);

// Routes with parameters
router.get('/:id', authenticate, userController.getUser);
router.put('/:id', authenticate, authorize(['ADMIN']), userValidation, userController.updateUser);
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.deleteUser);
router.get('/:id/tasks', authenticate, userController.getUserTasks);

module.exports = router;
