import express from 'express';
import {
    createUser,
    getAssignedTickets,
    closeTicket,
    addNoteToTicket,
    raiseTicketForUser,
} from '@controllers/itPersonController.js';
import { authMiddleware, roleMiddleware } from '@middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = express.Router();

// All routes require authentication and IT_PERSON role
router.use(authMiddleware);
router.use(roleMiddleware([Role.IT_PERSON]));

/**
 * @swagger
 * /api/it/user:
 *   post:
 *     summary: Create a new user (IT Person only)
 *     tags: [IT Person]
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
 * /api/it/tickets:
 *   get:
 *     summary: Get assigned tickets
 *     tags: [IT Person]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/tickets', getAssignedTickets);

/**
 * @swagger
 * /api/it/tickets/{ticketId}/close:
 *   put:
 *     summary: Close ticket
 *     tags: [IT Person]
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
 *         description: Ticket closed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
router.put('/tickets/:ticketId/close', closeTicket);

/**
 * @swagger
 * /api/it/tickets/{ticketId}/notes:
 *   post:
 *     summary: Add note to ticket
 *     tags: [IT Person]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
router.post('/tickets/:ticketId/notes', addNoteToTicket);

/**
 * @swagger
 * /api/it/tickets/raise:
 *   post:
 *     summary: Raise ticket for user
 *     tags: [IT Person]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - description
 *             properties:
 *               userId:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket raised successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.post('/tickets/raise', raiseTicketForUser);

export default router; 