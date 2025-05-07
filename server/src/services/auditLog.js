const { PrismaClient } = require('@prisma/client');
const winston = require('winston');
require('winston-daily-rotate-file');

const prisma = new PrismaClient();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Error logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    // Combined logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const createAuditLog = async (userId, action, details, taskId = null) => {
  try {
    // Extract entityId from details if it's an object, otherwise use a default
    const entityId = typeof details === 'object' 
      ? (details.entityId || details.taskId || details.projectId || details.teamId)
      : details;

    if (!entityId) {
      throw new Error('EntityId is required for audit log creation');
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        details,
        entityType: details.entityType || action.split('_')[0].toLowerCase(),
        entityId,
        user: {
          connect: {
            id: userId
          }
        },
        ...(taskId && {
          task: {
            connect: {
              id: taskId
            }
          }
        })
      }
    });

    // Log to Winston with structured data
    logger.info('Audit log created', {
      userId,
      action,
      details,
      taskId,
      timestamp: new Date().toISOString(),
      auditLogId: auditLog.id
    });

    return auditLog;
  } catch (error) {
    logger.error('Error creating audit log', {
      error: error.message,
      userId,
      action,
      details,
      taskId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

const getAuditLogs = async (filters = {}) => {
  const where = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.entityId) {
    where.entityId = filters.entityId;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate)
    };
  }

  const auditLogs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return auditLogs;
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  logger
}; 