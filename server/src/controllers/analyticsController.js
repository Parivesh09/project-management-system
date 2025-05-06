const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: {
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const stats = {
      totalTasks: project.tasks.length,
      tasksByStatus: {},
      tasksByPriority: {},
      overdueTasks: 0,
    };

    const now = new Date();

    project.tasks.forEach(task => {
      // Count by status
      stats.tasksByStatus[task.status] = (stats.tasksByStatus[task.status] || 0) + 1;

      // Count by priority
      stats.tasksByPriority[task.priority] = (stats.tasksByPriority[task.priority] || 0) + 1;

      // Count overdue tasks
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED') {
        stats.overdueTasks++;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user performance metrics
exports.getUserMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const metrics = {
      totalTasks: tasks.length,
      completedTasks: 0,
      completedOnTime: 0,
      averageCompletionTime: 0,
      tasksByPriority: {},
    };

    let totalCompletionTime = 0;
    let completedTasksCount = 0;

    tasks.forEach(task => {
      // Count by priority
      metrics.tasksByPriority[task.priority] = (metrics.tasksByPriority[task.priority] || 0) + 1;

      if (task.status === 'COMPLETED') {
        metrics.completedTasks++;

        // Check if completed on time
        if (task.dueDate && new Date(task.updatedAt) <= new Date(task.dueDate)) {
          metrics.completedOnTime++;
        }

        // Calculate completion time
        const completionTime = new Date(task.updatedAt) - new Date(task.createdAt);
        totalCompletionTime += completionTime;
        completedTasksCount++;
      }
    });

    // Calculate average completion time in days
    metrics.averageCompletionTime = completedTasksCount > 0
      ? Math.round(totalCompletionTime / completedTasksCount / (1000 * 60 * 60 * 24))
      : 0;

    res.json(metrics);
  } catch (error) {
    console.error('Get user metrics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get team performance metrics
exports.getTeamMetrics = async (req, res) => {
  try {
    const { teamId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            assignedTasks: {
              where: {
                updatedAt: {
                  gte: thirtyDaysAgo,
                },
              },
              select: {
                status: true,
                priority: true,
                dueDate: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const metrics = {
      totalMembers: team.members.length,
      totalTasks: 0,
      completedTasks: 0,
      completedOnTime: 0,
      averageCompletionTime: 0,
      memberPerformance: [],
    };

    let totalCompletionTime = 0;
    let completedTasksCount = 0;

    team.members.forEach(member => {
      const memberMetrics = {
        userId: member.id,
        name: member.username,
        totalTasks: member.assignedTasks.length,
        completedTasks: 0,
        completedOnTime: 0,
      };

      metrics.totalTasks += member.assignedTasks.length;

      member.assignedTasks.forEach(task => {
        if (task.status === 'COMPLETED') {
          metrics.completedTasks++;
          memberMetrics.completedTasks++;

          if (task.dueDate && new Date(task.updatedAt) <= new Date(task.dueDate)) {
            metrics.completedOnTime++;
            memberMetrics.completedOnTime++;
          }

          const completionTime = new Date(task.updatedAt) - new Date(task.createdAt);
          totalCompletionTime += completionTime;
          completedTasksCount++;
        }
      });

      metrics.memberPerformance.push(memberMetrics);
    });

    // Calculate average completion time in days
    metrics.averageCompletionTime = completedTasksCount > 0
      ? Math.round(totalCompletionTime / completedTasksCount / (1000 * 60 * 60 * 24))
      : 0;

    res.json(metrics);
  } catch (error) {
    console.error('Get team metrics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 