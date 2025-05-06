const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// Validation middleware
const taskValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('projectId').optional().isUUID().withMessage('Invalid project ID'),
  body('assigneeId').optional().isUUID().withMessage('Invalid assignee ID'),
  body('isRecurring').optional().isBoolean(),
  body('frequency').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY'])
];

// Routes
router.get('/', authenticate, taskController.getTasks);
router.post('/', authenticate, taskValidation, taskController.createTask);
router.get('/:id', authenticate, taskController.getTaskById);
router.put('/:id', authenticate, taskValidation, taskController.updateTask);
router.delete('/:id', authenticate, taskController.deleteTask);
router.get('/user/:userId', authenticate, taskController.getTasksByUser);

module.exports = router; 