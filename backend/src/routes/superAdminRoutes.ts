import express from 'express';
import {
    createAdmin,
    getUsersUnderSuperAdmin,
    getTicketsUnderSuperAdmin,
    filterTicketsByDate,
    deleteAdmin,
} from '@controllers/superAdminController.js';
import { authenticateToken as authMiddleware, authorize as roleMiddleware } from '@middleware/auth.js';
import { Role } from '@prisma/client';

const router = express.Router();

// All routes require authentication and SUPER_ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(Role.SUPER_ADMIN));

/**
 * @swagger
 * /api/superadmin/admin:
 *   post:
 *     summary: Create a new admin (Super Admin only)
 *     tags: [Super Admin]
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
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/admin', createAdmin);

/**
 * @swagger
 * /api/superadmin/admin/{id}:
 *   delete:
 *     summary: Delete admin (Super Admin only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Admin not found
 */
router.delete('/admin/:id', deleteAdmin);

/**
 * @swagger
 * /api/superadmin/users:
 *   get:
 *     summary: Get all users under super admin
 *     tags: [Super Admin]
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
router.get('/users', getUsersUnderSuperAdmin);

/**
 * @swagger
 * /api/superadmin/tickets:
 *   get:
 *     summary: Get all tickets under super admin
 *     tags: [Super Admin]
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
router.get('/tickets', getTicketsUnderSuperAdmin);

/**
 * @swagger
 * /api/superadmin/tickets/filter:
 *   get:
 *     summary: Filter tickets by date range
 *     tags: [Super Admin]
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