import express from 'express';
import {
    createTicket,
    getUserTickets,
    getTicketStatus,
} from '@controllers/userController.js';
import { authenticateToken as authMiddleware, authorize as roleMiddleware } from '@middleware/auth.js';
import { Role } from '@prisma/client';
import { authorize } from '@middleware/auth.js';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserBusinessType,
    getUsersByRole,
    getUsersByBusinessType,
    getUserAuditLogs,
    getUserLoginHistory
} from '@controllers/userController.js';

const router = express.Router();

// Apply authentication and USER role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(Role.USER));

/**
 * @swagger
 * /api/users/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               category:
 *                 type: string
 *                 enum: [HARDWARE, SOFTWARE, NETWORK, ACCESS, OTHER]
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/tickets', createTicket);

/**
 * @swagger
 * /api/users/tickets:
 *   get:
 *     summary: Get user's tickets
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tickets
 *       401:
 *         description: Unauthorized
 */
router.get('/tickets', getUserTickets);

/**
 * @swagger
 * /api/users/tickets/{ticketId}/status:
 *   get:
 *     summary: Get ticket status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/tickets/:ticketId/status', getTicketStatus);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin and Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               location:
 *                 type: string
 *               businessType:
 *                 type: string
 *                 enum: [SMALL, MEDIUM, LARGE]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [SYSTEM_OWNER, SUPER_ADMIN, ADMIN, IT_PERSON, USER]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', authorize('SUPER_ADMIN'), updateUserRole);

/**
 * @swagger
 * /api/users/{id}/business-type:
 *   patch:
 *     summary: Update user business type (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessType
 *             properties:
 *               businessType:
 *                 type: string
 *                 enum: [SMALL, MEDIUM, LARGE]
 *     responses:
 *       200:
 *         description: Business type updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch('/:id/business-type', authorize('ADMIN'), updateUserBusinessType);

/**
 * @swagger
 * /api/users/role/{role}:
 *   get:
 *     summary: Get users by role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SYSTEM_OWNER, SUPER_ADMIN, ADMIN, IT_PERSON, USER]
 *         description: User role
 *     responses:
 *       200:
 *         description: List of users by role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/role/:role', authorize('ADMIN'), getUsersByRole);

/**
 * @swagger
 * /api/users/business-type/{businessType}:
 *   get:
 *     summary: Get users by business type
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SMALL, MEDIUM, LARGE]
 *         description: Business type
 *     responses:
 *       200:
 *         description: List of users by business type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/business-type/:businessType', authorize('ADMIN'), getUsersByBusinessType);

/**
 * @swagger
 * /api/users/{id}/audit-logs:
 *   get:
 *     summary: Get user's audit logs (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's audit logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id/audit-logs', authorize('ADMIN'), getUserAuditLogs);

/**
 * @swagger
 * /api/users/{id}/login-history:
 *   get:
 *     summary: Get user's login history (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's login history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id/login-history', authorize('ADMIN'), getUserLoginHistory);

export default router; 