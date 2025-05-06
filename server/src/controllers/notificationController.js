const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.userId,
        read: false,
      },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create notification (internal use)
exports.createNotification = async (data) => {
  try {
    return await prisma.notification.create({
      data,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}; 