const { Request, Response } = require('express');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        teamMemberships: {
          select: {
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        teamMemberships: {
          select: {
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        createdTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, username, role, password } = req.body;

    // Check if user has permission to update role
    if (role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update role' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData = {
      email,
      username,
      role,
      ...(password && { password: await bcrypt.hash(password, 10) }),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admin can delete users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's tasks
exports.getUserTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where = {
      OR: [
        { assigneeId: id },
        { creatorId: id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user's profile (self)
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, currentPassword, newPassword } = req.body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    // If changing password, verify current password
    if (newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Prepare update data
    const updateData = {
      email,
      username,
      ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user settings
exports.updateUserSettings = async (req, res) => {
  const userId = req.user.userId;
  const {
    name,
    email,
    useCustomEmail,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    smtpFrom,
    notificationPref
  } = req.body;

  try {
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: userId
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        useCustomEmail: useCustomEmail || false,
        smtpHost: useCustomEmail ? smtpHost : null,
        smtpPort: useCustomEmail ? smtpPort : null,
        smtpSecure: useCustomEmail ? smtpSecure : true,
        smtpUser: useCustomEmail ? smtpUser : null,
        smtpPass: useCustomEmail ? smtpPass : null,
        smtpFrom: useCustomEmail ? smtpFrom : null,
        notificationPref: notificationPref || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        useCustomEmail: true,
        smtpHost: true,
        smtpPort: true,
        smtpSecure: true,
        smtpUser: true,
        smtpFrom: true,
        notificationPref: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ message: 'Failed to update user settings' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        useCustomEmail: true,
        smtpHost: true,
        smtpPort: true,
        smtpSecure: true,
        smtpUser: true,
        smtpFrom: true,
        notificationPref: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user details' });
  }
};
