import express from 'express';
import {
    createUser,
    getUsersUnderAdmin,
    getTicketsUnderAdmin,
    filterTicketsByDate,
    deleteUser,
} from '@controllers/adminController.js';
import { authenticateToken as authMiddleware, authorize as roleMiddleware } from '@middleware/auth.js';
import { Role } from '@prisma/client';

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(Role.ADMIN));

/**
 * @swagger
 * /api/admin/user:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [IT_PERSON, USER]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/user', createUser);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users under admin
 *     tags: [Admin]
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
router.get('/users', getUsersUnderAdmin);

/**
 * @swagger
 * /api/admin/user/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
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
router.delete('/user/:id', deleteUser);

/**
 * @swagger
 * /api/admin/tickets:
 *   get:
 *     summary: Get all tickets under admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/tickets', getTicketsUnderAdmin);

/**
 * @swagger
 * /api/admin/tickets/filter:
 *   get:
 *     summary: Filter tickets by date range
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Filtered list of tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/tickets/filter', filterTicketsByDate);

export default router; 