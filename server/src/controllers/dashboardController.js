const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      // Tasks assigned to the user
      prisma.task.findMany({
        where: { 
          assigneeId: userId,
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
        },
        orderBy: {
          dueDate: 'asc'
        }
      }),
      // Tasks created by the user
      prisma.task.findMany({
        where: { 
          creatorId: userId 
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
        },
        orderBy: {
          dueDate: 'asc'
        }
      }),
      // Overdue tasks
      prisma.task.findMany({
        where: {
          AND: [
            { dueDate: { lt: new Date() } },
            { status: { not: 'DONE' } },
            {
              OR: [
                { assigneeId: userId },
                { creatorId: userId }
              ]
            }
          ]
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
        },
        orderBy: {
          dueDate: 'asc'
        }
      })
    ]);

    // Combine and dedupe assigned and created tasks
    const combined = [...assignedTasks, ...createdTasks];
    const uniqueTasks = Array.from(
      new Map(combined.map(task => [task.id, task])).values()
    );
    const taskStats = {
      total: uniqueTasks.length,
      overdue: overdueTasks.length,
      completed: uniqueTasks.filter(task => task.status === 'DONE').length,
      inProgress: uniqueTasks.filter(task => task.status === 'IN_PROGRESS').length
    };
    
    res.json({
      assignedTasks,
      createdTasks,
      overdueTasks,
      taskStats
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
}; 