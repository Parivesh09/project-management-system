const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Extend Jest timeout for async operations
jest.setTimeout(10000);

// Clean up database before all tests
beforeAll(async () => {
  // Create test database tables if they don't exist
  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
}); 