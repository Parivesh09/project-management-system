const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { createNotification } = require('./models/notification');
const { getPreferences } = require('./models/notificationPreferences');
const { sendNotificationEmail } = require('./services/emailService');
const prisma = new PrismaClient();

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    
    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const sendNotification = async (userId, notification) => {
  try {
    // Get user's notification preferences
    const preferences = await getPreferences(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Save notification to database
    const savedNotification = await createNotification({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
    });

    // Send in-app notification if enabled
    if (preferences.inApp && preferences[notification.type]) {
      io.to(`user:${userId}`).emit('notification', savedNotification);
    }

    // Send email notification if enabled
    if (preferences.email && preferences[notification.type] && user?.email) {
      await sendNotificationEmail(user.email, savedNotification);
    }

    return savedNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotification,
}; 