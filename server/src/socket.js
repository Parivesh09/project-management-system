const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Authentication error');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join a personal room for private notifications
    socket.join(socket.user.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

const sendNotification = async (userId, notification) => {
  try {
    // Save notification to database
    await prisma.notification.create({
      data: {
        ...notification,
        userId
      }
    });

    // Send real-time notification
    if (io) {
      io.to(userId).emit('notification', notification);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = {
  initializeSocket,
  sendNotification
}; 