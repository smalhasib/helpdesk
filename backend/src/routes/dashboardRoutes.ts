import express from 'express';
import { authenticateToken, authorize } from '@middleware/auth.js';
import { getDashboardStats, getHistoricalStats } from '@controllers/dashboardController.js';
import { Role } from '@prisma/client';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTickets:
 *                   type: integer
 *                 openTickets:
 *                   type: integer
 *                 closedTickets:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 ticketsByPriority:
 *                   type: object
 *                   properties:
 *                     LOW:
 *                       type: integer
 *                     MEDIUM:
 *                       type: integer
 *                     HIGH:
 *                       type: integer
 *                     URGENT:
 *                       type: integer
 *                 ticketsByCategory:
 *                   type: object
 *                   properties:
 *                     HARDWARE:
 *                       type: integer
 *                     SOFTWARE:
 *                       type: integer
 *                     NETWORK:
 *                       type: integer
 *                     ACCESS:
 *                       type: integer
 *                     OTHER:
 *                       type: integer
 *                 ticketsByStatus:
 *                   type: object
 *                 recentTickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                 recentUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/dashboard/historical:
 *   get:
 *     summary: Get historical statistics (Admin/Super Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for historical data
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for historical data
 *     responses:
 *       200:
 *         description: Historical statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   totalTickets:
 *                     type: integer
 *                   openTickets:
 *                     type: integer
 *                   closedTickets:
 *                     type: integer
 *                   totalUsers:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/historical', authorize(Role.ADMIN, Role.SUPER_ADMIN), getHistoricalStats);

export default router; 