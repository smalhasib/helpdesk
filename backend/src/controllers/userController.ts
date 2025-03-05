import { Request, Response } from 'express';
import { Role, BusinessType } from '@prisma/client';
import { CreateTicketDto } from '@/types/index.js';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma.js';

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { title, description, category, priority, ipAddress, deviceName }: CreateTicketDto = req.body;
        const userId = req.user!.userId;

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
                status: 'PENDING',
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'TICKET_CREATED',
                details: `User created ticket #${ticket.id}`,
                userId,
            },
        });

        return res.status(201).json({
            message: 'Ticket created successfully',
            ticket,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error creating ticket' });
    }
};

export const getUserTickets = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const tickets = await prisma.ticket.findMany({
            where: { userId },
            include: {
                assigned: { select: { username: true } },
                notes: {
                    include: {
                        addedBy: { select: { username: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tickets' });
    }
};

export const getTicketStatus = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user!.userId;

        const ticket = await prisma.ticket.findFirst({
            where: {
                id: Number(ticketId),
                userId,
            },
            select: {
                status: true,
                assigned: { select: { username: true } },
                notes: {
                    include: {
                        addedBy: { select: { username: true } },
                    },
                },
            },
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        return res.json(ticket);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching ticket status' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const userRole = req.user?.role;

        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ message: 'Error fetching users' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        // Allow users to view their own profile or admins to view any profile
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userId !== Number(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ message: 'Error fetching user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        // Only allow users to update their own profile or admins to update any profile
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userId !== Number(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updateData: any = { name, email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ message: 'Error updating user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role;

        if (userRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only super admin can delete users' });
        }

        await prisma.user.delete({
            where: { id: Number(id) }
        });

        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ message: 'Error deleting user' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const userRole = req.user?.role;

        if (userRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only super admin can update user roles' });
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return res.json(user);
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({ message: 'Error updating user role' });
    }
};

export const updateUserBusinessType = async (req: Request, res: Response) => {
    try {
        const { businessType } = req.body;
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { businessType },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user business type' });
    }
};

export const getUsersByRole = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: req.params.role as Role },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users by role' });
    }
};

export const getUsersByBusinessType = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: { businessType: req.params.businessType as BusinessType },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users by business type' });
    }
};

export const getUserAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { userId: parseInt(req.params.id) },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user audit logs' });
    }
};

export const getUserLoginHistory = async (req: Request, res: Response) => {
    try {
        const history = await prisma.loginHistory.findMany({
            where: { userId: parseInt(req.params.id) },
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user login history' });
    }
}; 