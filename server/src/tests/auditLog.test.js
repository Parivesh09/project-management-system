const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createAuditLog, getAuditLogs, logger } = require('../services/auditLog');

const prisma = new PrismaClient();

describe('Audit Logging System', () => {
  let testUser;
  let testProject;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'ADMIN'
      }
    });

    // Create test project
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'Test project for audit logs',
        startDate: new Date(),
        endDate: new Date(),
        ownerId: testUser.id
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.auditLog.deleteMany({
      where: {
        userId: testUser.id
      }
    });
    await prisma.project.delete({
      where: {
        id: testProject.id
      }
    });
    await prisma.user.delete({
      where: {
        id: testUser.id
      }
    });
    await prisma.$disconnect();
  });

  describe('createAuditLog', () => {
    it('should create an audit log entry', async () => {
      const auditLog = await createAuditLog(
        testUser.id,
        'PROJECT_CREATED',
        {
          projectId: testProject.id,
          projectName: testProject.name,
          details: `Created project: ${testProject.name}`
        }
      );

      expect(auditLog).toBeDefined();
      expect(auditLog.userId).toBe(testUser.id);
      expect(auditLog.action).toBe('PROJECT_CREATED');
      expect(auditLog.entityType).toBe('project');
      expect(auditLog.entityId).toBe(testProject.id);
    });

    it('should handle errors gracefully', async () => {
      await expect(createAuditLog(
        'invalid-user-id',
        'TEST_ACTION',
        { details: 'test' }
      )).rejects.toThrow();
    });
  });

  describe('getAuditLogs', () => {
    beforeEach(async () => {
      // Create some test audit logs
      await Promise.all([
        createAuditLog(testUser.id, 'TEST_ACTION_1', { details: 'test 1' }),
        createAuditLog(testUser.id, 'TEST_ACTION_2', { details: 'test 2' }),
        createAuditLog(testUser.id, 'TEST_ACTION_3', { details: 'test 3' })
      ]);
    });

    it('should retrieve audit logs with filters', async () => {
      const logs = await getAuditLogs({
        userId: testUser.id,
        action: 'TEST_ACTION_1'
      });

      expect(logs).toBeDefined();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('TEST_ACTION_1');
    });

    it('should retrieve all audit logs for a user', async () => {
      const logs = await getAuditLogs({
        userId: testUser.id
      });

      expect(logs).toBeDefined();
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Winston Logger', () => {
    it('should log messages correctly', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      const errorSpy = jest.spyOn(logger, 'error');

      logger.info('Test info message', { test: true });
      logger.error('Test error message', { error: 'test error' });

      expect(infoSpy).toHaveBeenCalledWith('Test info message', { test: true });
      expect(errorSpy).toHaveBeenCalledWith('Test error message', { error: 'test error' });

      infoSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
}); 