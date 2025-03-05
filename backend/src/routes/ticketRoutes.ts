import express from 'express';
import { authenticateToken, authorize } from '@middleware/auth.js';
import { Role } from '@prisma/client';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    assignTicket,
    addNote,
    getNotes,
    getTicketsByUser,
    getAssignedTickets,
    getTicketsByStatus,
    getTicketsByPriority,
    getTicketsByCategory,
    closeTicket,
    reopenTicket,
    deleteTicket
} from '@controllers/ticketController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
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
 *               ipAddress:
 *                 type: string
 *               deviceName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTicket);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets (Admin/IT Person only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filter by priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [HARDWARE, SOFTWARE, NETWORK, ACCESS, OTHER]
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize(Role.ADMIN, Role.IT_PERSON), getTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', getTicketById);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
router.patch('/:id/status', authorize(Role.ADMIN, Role.IT_PERSON), updateTicketStatus);

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   post:
 *     summary: Assign ticket to IT person
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket or user not found
 */
router.post('/:id/assign', authorize(Role.ADMIN, Role.IT_PERSON), assignTicket);

/**
 * @swagger
 * /api/tickets/{id}/notes:
 *   post:
 *     summary: Add note to ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       404:
 *         description: Ticket not found
 */
router.post('/:id/notes', addNote);

/**
 * @swagger
 * /api/tickets/{id}/notes:
 *   get:
 *     summary: Get ticket notes
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/:id/notes', getNotes);

/**
 * @swagger
 * /api/tickets/user/{userId}:
 *   get:
 *     summary: Get tickets by user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/user/:userId', getTicketsByUser);

/**
 * @swagger
 * /api/tickets/assigned:
 *   get:
 *     summary: Get assigned tickets (IT Person only)
 *     tags: [Tickets]
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
router.get('/assigned', authorize(Role.IT_PERSON), getAssignedTickets);

/**
 * @swagger
 * /api/tickets/status/{status}:
 *   get:
 *     summary: Get tickets by status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket status
 *     responses:
 *       200:
 *         description: List of tickets by status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/status/:status', authorize(Role.ADMIN, Role.IT_PERSON), getTicketsByStatus);

/**
 * @swagger
 * /api/tickets/priority/{priority}:
 *   get:
 *     summary: Get tickets by priority
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: priority
 *         required: true
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Ticket priority
 *     responses:
 *       200:
 *         description: List of tickets by priority
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/priority/:priority', authorize(Role.ADMIN, Role.IT_PERSON), getTicketsByPriority);

/**
 * @swagger
 * /api/tickets/category/{category}:
 *   get:
 *     summary: Get tickets by category
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [HARDWARE, SOFTWARE, NETWORK, ACCESS, OTHER]
 *         description: Ticket category
 *     responses:
 *       200:
 *         description: List of tickets by category
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/category/:category', authorize(Role.ADMIN, Role.IT_PERSON), getTicketsByCategory);

/**
 * @swagger
 * /api/tickets/{id}/close:
 *   post:
 *     summary: Close ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.post('/:id/close', authorize(Role.ADMIN, Role.IT_PERSON), closeTicket);

/**
 * @swagger
 * /api/tickets/{id}/reopen:
 *   post:
 *     summary: Reopen ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket reopened successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
router.post('/:id/reopen', authorize(Role.ADMIN, Role.IT_PERSON), reopenTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete ticket (Admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
router.delete('/:id', authorize(Role.ADMIN), deleteTicket);

export default router; 