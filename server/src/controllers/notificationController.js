const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('../models/notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log("id", id);
    console.log("userId", userId);
    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update the notification
    const updatedNotification = await prisma.notification.update({
      where: {
        id: id
      },
      data: {
        read: true
      }
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteNotification(
      id,
      req.user.userId
    );
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

const clearAllUserNotifications = async (req, res) => {
  try {
    await clearAllNotifications(req.user.userId);
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  clearAllUserNotifications,
}; 