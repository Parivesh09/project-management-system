const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { PrismaClient } = require('@prisma/client');
const { initializeSocket } = require('./socket');
const { scheduleRecurringTasks } = require('./services/recurringTasks');
const {authenticate, authorize} = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
const io = initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Initialize recurring tasks scheduler
scheduleRecurringTasks();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', authenticate, require('./routes/notifications'));
app.use('/api/search', authenticate, require('./routes/searchRoutes'));
app.use('/api/analytics', authenticate, authorize(['ADMIN', 'MANAGER']), require('./routes/analytics'));
app.use('/api/audit-logs', authenticate, authorize(['ADMIN']), require('./routes/auditLogs'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
}); 