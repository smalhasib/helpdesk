import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CreateUserDto, CreateTicketDto, CreateTicketNoteDto } from '@/types/index.js';
import prisma from '@/lib/prisma.js';

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password }: CreateUserDto = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: Role.USER,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'USER_CREATED',
                details: `IT Person created User: ${username}`,
                userId: req.user!.userId,
            },
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error creating user' });
    }
};

export const getAssignedTickets = async (req: Request, res: Response) => {
    try {
        const itPersonId = req.user!.userId;

        const tickets = await prisma.ticket.findMany({
            where: { assignedTo: itPersonId },
            include: {
                user: { select: { username: true } },
            },
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching assigned tickets' });
    }
};

export const closeTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const itPersonId = req.user!.userId;

        // Check if ticket exists and is assigned to the IT Person
        const ticket = await prisma.ticket.findFirst({
            where: {
                id: Number(ticketId),
                assignedTo: itPersonId,
            },
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found or not assigned to you' });
        }

        // Update ticket status
        const updatedTicket = await prisma.ticket.update({
            where: { id: Number(ticketId) },
            data: {
                status: 'SOLVED',
                closedAt: new Date(),
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'TICKET_CLOSED',
                details: `IT Person closed ticket #${ticketId}`,
                userId: itPersonId,
            },
        });

        return res.json({
            message: 'Ticket closed successfully',
            ticket: updatedTicket,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error closing ticket' });
    }
};

export const addNoteToTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const { note }: CreateTicketNoteDto = req.body;
        const itPersonId = req.user!.userId;

        // Check if ticket exists and is assigned to the IT Person
        const ticket = await prisma.ticket.findFirst({
            where: {
                id: Number(ticketId),
                assignedTo: itPersonId,
            },
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found or not assigned to you' });
        }

        // Add note to ticket
        const ticketNote = await prisma.ticketNote.create({
            data: {
                note,
                ticketId: Number(ticketId),
                addedById: itPersonId,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'TICKET_NOTE_ADDED',
                details: `IT Person added note to ticket #${ticketId}`,
                userId: itPersonId,
            },
        });

        return res.status(201).json(ticketNote);
    } catch (error) {
        return res.status(500).json({ error: 'Error adding note to ticket' });
    }
};

export const raiseTicketForUser = async (req: Request, res: Response) => {
    try {
        const { userId, title, description, category, priority, ipAddress, deviceName }: CreateTicketDto & { userId: number } = req.body;
        const itPersonId = req.user!.userId;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create ticket
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                category,
                priority: priority || 'MEDIUM',
                ipAddress,
                deviceName,
                userId,
                assignedTo: itPersonId,
                status: 'PENDING',
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'TICKET_CREATED',
                details: `IT Person created ticket for user ${user.username}`,
                userId: itPersonId,
            },
        });

        return res.status(201).json(ticket);
    } catch (error) {
        return res.status(500).json({ error: 'Error raising ticket' });
    }
}; 