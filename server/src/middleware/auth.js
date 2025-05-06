const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.id
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = {
  authenticate,
  authorize
}; 