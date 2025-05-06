const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();

// Get all projects
router.get('/', authenticate, getProjects);

// Get a specific project
router.get('/:id', authenticate, getProjectById);

// Create a new project
router.post('/', authenticate, authorize(['ADMIN','MANAGER']), createProject);

// Update a project
router.put('/:id', authenticate, updateProject);

// Delete a project
router.delete('/:id', authenticate, authorize(['ADMIN','MANAGER']), deleteProject);

module.exports = router;
