const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth, subMonths } = require('date-fns');

const prisma = new PrismaClient();

const getTaskCompletionRate = async (userId = null, teamId = null, period = 'month') => {
  const startDate = period === 'month' ? startOfMonth(new Date()) : subMonths(new Date(), 3);
  const endDate = endOfMonth(new Date());

  const where = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  if (userId) {
    where.userId = userId;
  }

  if (teamId) {
    where.project = {
      teamId: teamId
    };
  }

  const [completedTasks, totalTasks] = await Promise.all([
    prisma.task.count({
      where: {
        ...where,
        status: 'COMPLETED'
      }
    }),
    prisma.task.count({
      where
    })
  ]);

  return {
    completedTasks,
    totalTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  };
};

const getTasksByPriority = async (userId = null, teamId = null) => {
  const where = {};
  if (userId) {
    where.userId = userId;
  }

  if (teamId) {
    where.project = {
      teamId: teamId
    };
  }

  const tasks = await prisma.task.groupBy({
    by: ['priority'],
    _count: {
      id: true
    },
    where
  });

  return tasks?.map(({ priority, _count }) => ({
    priority,
    count: _count.id
  }));
};

const getOverdueTasks = async (userId = null, teamId = null) => {
  const where = {
    dueDate: {
      lt: new Date()
    },
    status: {
      not: 'COMPLETED'
    }
  };

  if (userId) {
    where.userId = userId;
  }

  if (teamId) {
    where.project = {
      teamId: teamId
    };
  }

  const overdueTasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return overdueTasks;
};

const getUserProductivity = async (userId, teamId = null) => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const where = {
    userId,
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  if (teamId) {
    where.project = {
      teamId: teamId
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    select: {
      status: true,
      createdAt: true,
      updatedAt: true,
      priority: true
    }
  });

  const metrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
    averageCompletionTime: 0,
    tasksByPriority: {
      HIGH: tasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: tasks.filter(t => t.priority === 'LOW').length
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  if (completedTasks.length > 0) {
    const totalCompletionTime = completedTasks.reduce((acc, task) => {
      return acc + (new Date(task.updatedAt) - new Date(task.createdAt));
    }, 0);
    metrics.averageCompletionTime = totalCompletionTime / completedTasks.length;
  }

  return metrics;
};

const getTeamMetrics = async (teamId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: true
        }
      },
      projects: {
        include: {
          tasks: true
        }
      }
    }
  });

  if (!team) {
    throw new Error('Team not found');
  }

  const metrics = {
    totalMembers: team.members.length,
    totalProjects: team.projects.length,
    totalTasks: team.projects.reduce((acc, project) => acc + project.tasks.length, 0),
    memberMetrics: await Promise.all(
      team.members.map(async (member) => ({
        userId: member.user.id,
        name: member.user.name,
        role: member.role,
        ...(await getUserProductivity(member.user.id, teamId))
      }))
    )
  };

  return metrics;
};

module.exports = {
  getTaskCompletionRate,
  getTasksByPriority,
  getOverdueTasks,
  getUserProductivity,
  getTeamMetrics
}; 