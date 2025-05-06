const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('./auditLog');

const prisma = new PrismaClient();

const createProject = async (data, creatorId) => {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      teamId: data.teamId
    },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });

  await createAuditLog(
    creatorId,
    'PROJECT_CREATED',
    `Created project: ${project.name}`
  );

  return project;
};

const updateProject = async (projectId, data, userId) => {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate
    },
    include: {
      team: true
    }
  });

  await createAuditLog(
    userId,
    'PROJECT_UPDATED',
    `Updated project: ${project.name}`
  );

  return project;
};

const getProjectDetails = async (projectId) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      tasks: {
        include: {
          assignedTo: true,
          createdBy: true,
          attachments: true,
          comments: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });
};

const getProjectTasks = async (projectId, filters = {}) => {
  const where = {
    projectId
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.assignee) {
    where.userId = filters.assignee;
  }

  return prisma.task.findMany({
    where,
    include: {
      assignedTo: true,
      createdBy: true,
      attachments: true,
      comments: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });
};

const getProjectMetrics = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: true
    }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const metrics = {
    totalTasks: project.tasks.length,
    completedTasks: project.tasks.filter(t => t.status === 'COMPLETED').length,
    overdueTasks: project.tasks.filter(t => 
      t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date()
    ).length,
    tasksByStatus: {
      TODO: project.tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
      COMPLETED: project.tasks.filter(t => t.status === 'COMPLETED').length
    },
    tasksByPriority: {
      HIGH: project.tasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: project.tasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: project.tasks.filter(t => t.priority === 'LOW').length
    }
  };

  return metrics;
};

module.exports = {
  createProject,
  updateProject,
  getProjectDetails,
  getProjectTasks,
  getProjectMetrics
}; 