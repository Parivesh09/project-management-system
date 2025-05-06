const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { addDays, addWeeks, addMonths } = require('date-fns');
const { sendNotification } = require('../socket');
const { createAuditLog } = require('./auditLog');

const prisma = new PrismaClient();

const createRecurringTask = async (taskData) => {
  const task = await prisma.task.create({
    data: {
      ...taskData,
      isRecurring: true
    },
    include: {
      assignee: true,
      project: true,
      creator: true
    }
  });

  await createAuditLog(
    taskData.creatorId,
    'TASK_CREATED',
    `Created recurring task: ${task.title}`,
    task.id
  );

  return task;
};

const scheduleRecurringTasks = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const recurringTasks = await prisma.task.findMany({
        where: {
          isRecurring: true
        },
        include: {
          assignee: true,
          project: true,
          creator: true
        }
      });

      for (const task of recurringTasks) {
        const today = new Date();
        const dueDate = new Date(task.dueDate);

        // Check if task needs to be recreated based on frequency
        if (today >= dueDate) {
          let newDueDate;
          switch (task.frequency) {
            case 'daily':
              newDueDate = addDays(dueDate, 1);
              break;
            case 'weekly':
              newDueDate = addWeeks(dueDate, 1);
              break;
            case 'monthly':
              newDueDate = addMonths(dueDate, 1);
              break;
            default:
              continue;
          }

          // Create new instance of recurring task
          const newTask = await prisma.task.create({
            data: {
              title: task.title,
              description: task.description,
              status: 'TODO',
              priority: task.priority,
              dueDate: newDueDate,
              isRecurring: true,
              frequency: task.frequency,
              userId: task.userId,
              creatorId: task.creatorId,
              projectId: task.projectId
            }
          });

          // Create audit log
          await createAuditLog(
            task.creatorId,
            'RECURRING_TASK_CREATED',
            `Created new instance of recurring task: ${task.title}`,
            newTask.id
          );

          // Send notification to assigned user
          if (task.assignee.notificationPref !== 'NONE') {
            await sendNotification(task.userId, {
              message: `New recurring task created: ${task.title}`,
              type: 'TASK_CREATED'
            });
          }

          // Update original task's due date
          await prisma.task.update({
            where: { id: task.id },
            data: { dueDate: newDueDate }
          });
        }
      }
    } catch (error) {
      console.error('Error processing recurring tasks:', error);
    }
  });
};

module.exports = {
  createRecurringTask,
  scheduleRecurringTasks
}; 