import { Request, Response } from 'express';
import { TicketPriority, TicketCategory } from '@prisma/client';
import prisma from '@/lib/prisma.js';

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { title, description, priority, category, ipAddress, deviceName } = req.body;
        const userId = req.user!.userId;

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority,
                category,
                ipAddress,
                deviceName,
                userId,
            },
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: 'Error creating ticket' });
    }
};

export const getTickets = async (req: Request, res: Response) => {
    try {
        const { status, priority, category } = req.query;
        const where: any = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (category) where.category = category;

        const tickets = await prisma.ticket.findMany({ where });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tickets' });
    }
};

export const getTicketById = async (req: Request, res: Response) => {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        return res.json(ticket);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching ticket' });
    }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Error updating ticket status' });
    }
};

export const assignTicket = async (req: Request, res: Response) => {
    try {
        const { assignedTo } = req.body;
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(req.params.id) },
            data: { assignedTo },
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Error assigning ticket' });
    }
};

export const addNote = async (req: Request, res: Response) => {
    try {
        const { note } = req.body;
        const ticketNote = await prisma.ticketNote.create({
            data: {
                note,
                ticketId: parseInt(req.params.id),
                addedById: req.user!.userId,
            },
        });
        res.status(201).json(ticketNote);
    } catch (error) {
        res.status(500).json({ error: 'Error adding note' });
    }
};

export const getNotes = async (req: Request, res: Response) => {
    try {
        const notes = await prisma.ticketNote.findMany({
            where: { ticketId: parseInt(req.params.id) },
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
};

export const getTicketsByUser = async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            where: { userId: parseInt(req.params.userId) },
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user tickets' });
    }
};

export const getAssignedTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            where: { assignedTo: req.user!.userId },
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching assigned tickets' });
    }
};

export const getTicketsByStatus = async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            where: { status: req.params.status },
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tickets by status' });
    }
};

export const getTicketsByPriority = async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            where: { priority: req.params.priority as TicketPriority },
        });
        return res.json(tickets);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching tickets by priority' });
    }
};

export const getTicketsByCategory = async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            where: { category: req.params.category as TicketCategory },
        });
        return res.json(tickets);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching tickets by category' });
    }
};

export const closeTicket = async (req: Request, res: Response) => {
    try {
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(req.params.id) },
            data: {
                status: 'CLOSED',
                closedAt: new Date(),
            },
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Error closing ticket' });
    }
};

export const reopenTicket = async (req: Request, res: Response) => {
    try {
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(req.params.id) },
            data: {
                status: 'OPEN',
                closedAt: null,
            },
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Error reopening ticket' });
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        await prisma.ticket.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting ticket' });
    }
}; 