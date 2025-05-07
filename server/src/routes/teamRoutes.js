const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createTeam,
  getTeams,
  getTeamDetails,
  updateTeam,
  deleteTeam,
  joinTeamWithCode,
  createTeamInvite,
  getTeamInviteCode
} = require('../controllers/teamController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Team name
 *         description:
 *           type: string
 *           description: Team description
 *         inviteCode:
 *           type: string
 *           description: Unique code for team invitations
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams for the current user
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getTeams);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team details by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, getTeamDetails);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update team details
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, MANAGER, USER]
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, authorize(['ADMIN','MANAGER']), updateTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteTeam);

/**
 * @swagger
 * /api/teams/{teamId}/invite:
 *   post:
 *     summary: Create team invitation
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/:teamId/invite', authenticate, authorize(['ADMIN','MANAGER']), createTeamInvite);

/**
 * @swagger
 * /api/teams/join:
 *   post:
 *     summary: Join team with invite code
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined team
 *       400:
 *         description: Invalid invite code or already a member
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.post('/join', authenticate, joinTeamWithCode);

/**
 * @swagger
 * /api/teams/{teamId}/invite-code:
 *   get:
 *     summary: Get team invite code
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team to get invite code for
 *     responses:
 *       200:
 *         description: Team invite code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inviteCode:
 *                   type: string
 *                   description: The invite code for the team
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized - Must be team admin or manager
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
router.get('/:teamId/invite-code', authenticate, authorize(['ADMIN', 'MANAGER']), getTeamInviteCode);

module.exports = router;
