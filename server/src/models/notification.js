const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationTypes = {
  TASK_ASSIGNED: 'taskAssigned',
  TASK_UPDATED: 'taskUpdated',
  TASK_COMPLETED: 'taskCompleted',
  TASK_COMMENTED: 'taskCommented',
};

const createNotification = async (data) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      read: false,
    },
  });
};

const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const markAsRead = async (notificationId) => {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  });
};

const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
};

const deleteNotification = async (notificationId) => {
  return prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });
};

const clearAllNotifications = async (userId) => {
  return prisma.notification.deleteMany({
    where: {
      userId,
    },
  });
};

module.exports = {
  notificationTypes,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
}; 