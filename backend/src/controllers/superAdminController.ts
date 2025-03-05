import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CreateUserDto, FilterTicketsDto } from '@/types/index.js';
import prisma from '@/lib/prisma.js';

export const createAdmin = async (req: Request, res: Response) => {
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

        // Create admin user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'ADMIN_CREATED',
                details: `Super Admin created Admin: ${username}`,
                userId: req.user!.userId,
            },
        });

        return res.status(201).json({
            message: 'Admin created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error creating Admin' });
    }
};

export const getUsersUnderSuperAdmin = async (_req: Request, res: Response) => {
    try {
        const admins = await prisma.user.findMany({
            where: { role: Role.ADMIN },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });

        const itPersons = await prisma.user.findMany({
            where: { role: Role.IT_PERSON },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });

        const users = await prisma.user.findMany({
            where: { role: Role.USER },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });

        res.json({ admins, itPersons, users });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

export const getTicketsUnderSuperAdmin = async (_req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                user: { select: { username: true } },
                assigned: { select: { username: true } },
            },
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tickets' });
    }
};

export const filterTicketsByDate = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query as FilterTicketsDto;

        if (!from || !to) {
            return res.status(400).json({ error: 'Provide "from" and "to" dates' });
        }

        const tickets = await prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
            include: {
                user: { select: { username: true } },
                assigned: { select: { username: true } },
            },
        });

        return res.json(tickets);
    } catch (error) {
        return res.status(500).json({ error: 'Error filtering tickets' });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if user exists and is an admin
        const user = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: Role.ADMIN,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Delete user
        await prisma.user.delete({
            where: { id: user.id },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'ADMIN_DELETED',
                details: `Super Admin deleted Admin: ${user.username}`,
                userId: req.user!.userId,
            },
        });

        return res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting Admin' });
    }
}; 