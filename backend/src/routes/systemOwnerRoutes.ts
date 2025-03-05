import express from 'express';
import {
    createSuperAdmin,
    updateSuperAdminExpiry,
    deleteSuperAdmin,
    getSystemReports,
} from '@controllers/systemOwnerController.js';
import { authenticateToken as authMiddleware, authorize as roleMiddleware } from '@middleware/auth.js';
import { Role } from '@prisma/client';

const router = express.Router();

// All routes require authentication and SYSTEM_OWNER role
router.use(authMiddleware);
router.use(roleMiddleware(Role.SYSTEM_OWNER));

/**
 * @swagger
 * /api/system/superadmin:
 *   post:
 *     summary: Create a new super admin (System Owner only)
 *     tags: [System Owner]
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
 *               - expiryDate
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Super admin created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/superadmin', createSuperAdmin);

/**
 * @swagger
 * /api/system/superadmin/{id}/expiry:
 *   put:
 *     summary: Update super admin expiry date
 *     tags: [System Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Super Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expiryDate
 *             properties:
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Expiry date updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Super admin not found
 */
router.put('/superadmin/:id/expiry', updateSuperAdminExpiry);

/**
 * @swagger
 * /api/system/superadmin/{id}:
 *   delete:
 *     summary: Delete super admin
 *     tags: [System Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Super Admin ID
 *     responses:
 *       200:
 *         description: Super admin deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Super admin not found
 */
router.delete('/superadmin/:id', deleteSuperAdmin);

/**
 * @swagger
 * /api/system/reports:
 *   get:
 *     summary: Get system reports
 *     tags: [System Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalTickets:
 *                   type: integer
 *                 activeUsers:
 *                   type: integer
 *                 expiredUsers:
 *                   type: integer
 *                 ticketsByStatus:
 *                   type: object
 *                 ticketsByPriority:
 *                   type: object
 *                 ticketsByCategory:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/reports', getSystemReports);

export default router; 