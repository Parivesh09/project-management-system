const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { sendNotification } = require('../socket');
const { createAuditLog } = require('../services/auditLog');

const prisma = new PrismaClient();

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, projectId, assigneeId, creatorId } = req.query;
    const currentUserId = req.user.userId;
    
    // Base query conditions
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;

    // Only include tasks that user created, is assigned to, or belongs via project
    where.OR = [
      { creatorId: currentUserId },
      { assigneeId: currentUserId },
      {
        AND: [
          { projectId: { not: null } },
          {
            OR: [
              { project: { ownerId: currentUserId } },
              { project: { managerId: currentUserId } },
              { project: { teams: { some: { team: { members: { some: { userId: currentUserId } } } } } } }
            ]
          }
        ]
      }
    ];

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
      isRecurring,
      frequency
    } = req.body;

    const creatorId = req.user.userId;

    // Validate project if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    // Validate assignee if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });
      if (!assignee) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }

    // Calculate nextRun for recurring tasks
    let nextRun = null;
    if (isRecurring && frequency) {
      nextRun = new Date(dueDate);
      switch (frequency) {
        case 'DAILY':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'WEEKLY':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'MONTHLY':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: new Date(dueDate),
        projectId,
        creatorId,
        assigneeId,
        isRecurring,
        frequency,
        nextRun
      },
      include: {
        project: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      creatorId,
      'TASK_CREATED',
      {
        taskId: task.id,
        taskTitle: task.title,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        details: `Created task: ${task.title}`
      }
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserTasks = async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId;
  // Load task and user role
  const [taskRecord, user] = await Promise.all([
    prisma.task.findUnique({ where: { id }, select: { creatorId: true, assigneeId: true, title: true } }),
    prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } })
  ]);
  if (!taskRecord) return res.status(404).json({ message: 'Task not found' });
  // Allow global admins/managers or task creator/assignee
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER' && taskRecord.creatorId !== currentUserId && taskRecord.assigneeId !== currentUserId) {
    return res.status(403).json({ message: 'Insufficient permissions to update this task' });
  }
  try {
    const updateData = req.body;

    // Remove undefined fields
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    // If updating dueDate and task is recurring, update nextRun
    if (updateData.dueDate && updateData.isRecurring) {
      const task = await prisma.task.findUnique({
        where: { id },
        select: { frequency: true }
      });

      if (task?.frequency) {
        const nextRun = new Date(updateData.dueDate);
        switch (task.frequency) {
          case 'DAILY':
            nextRun.setDate(nextRun.getDate() + 1);
            break;
          case 'WEEKLY':
            nextRun.setDate(nextRun.getDate() + 7);
            break;
          case 'MONTHLY':
            nextRun.setMonth(nextRun.getMonth() + 1);
            break;
        }
        updateData.nextRun = nextRun;
      }
    }

    // Map incoming status value 'COMPLETED' to Prisma enum 'DONE'
    if (updateData.status === 'COMPLETED') {
      updateData.status = 'DONE';
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      currentUserId,
      'TASK_UPDATED',
      {
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        projectId: updatedTask.projectId,
        assigneeId: updatedTask.assigneeId,
        changes: updateData,
        details: `Updated task: ${updatedTask.title}`
      }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId;
  const [taskRecord, user] = await Promise.all([
    prisma.task.findUnique({ 
      where: { id }, 
      select: { 
        creatorId: true, 
        assigneeId: true,
        title: true,
        projectId: true
      } 
    }),
    prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } })
  ]);
  if (!taskRecord) return res.status(404).json({ message: 'Task not found' });
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER' && taskRecord.creatorId !== currentUserId) {
    return res.status(403).json({ message: 'Insufficient permissions to delete this task' });
  }
  try {
    await prisma.task.delete({ where: { id } });

    // Create audit log
    await createAuditLog(
      currentUserId,
      'TASK_DELETED',
      {
        taskId: id,
        taskTitle: taskRecord.title,
        projectId: taskRecord.projectId,
        assigneeId: taskRecord.assigneeId,
        details: `Deleted task: ${taskRecord.title}`
      }
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        task: { connect: { id } },
        user: { connect: { id: req.user.userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchTasks = async (req, res) => {
  const { query, status, priority, startDate, endDate } = req.query;
  
  try {
    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          status && { status },
          priority && { priority },
          startDate && endDate && {
            dueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        ]
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const where = {
      OR: [
        { assigneeId: userId },
        { creatorId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};