const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../services/auditLog');

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs with optional filters (Admin only)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter logs by user ID
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter logs by entity type (project, task, etc.)
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *         description: Filter logs by entity ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter logs by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   action:
 *                     type: string
 *                   entityType:
 *                     type: string
 *                   entityId:
 *                     type: string
 *                   details:
 *                     type: object
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate
    } = req.query;

    const filters = {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate
    };

    const auditLogs = await getAuditLogs(filters);
    res.json(auditLogs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 