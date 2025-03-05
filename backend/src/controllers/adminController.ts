import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { CreateUserDto, FilterTicketsDto } from '@/types/index.js';
import prisma from '@/lib/prisma.js';

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role }: CreateUserDto = req.body;

        // Validate role
        if (role !== Role.IT_PERSON && role !== Role.USER) {
            return res.status(400).json({ error: 'Admins can only create IT Person or User accounts' });
        }

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
                role,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'USER_CREATED',
                details: `Admin created ${role}: ${username}`,
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

export const getUsersUnderAdmin = async (_req: Request, res: Response) => {
    try {
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

        return res.json({ itPersons, users });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching users' });
    }
};

export const getTicketsUnderAdmin = async (_req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                user: { select: { username: true } },
                assigned: { select: { username: true } },
            },
        });

        return res.json(tickets);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching tickets' });
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

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if user exists and is either IT Person or User
        const user = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: {
                    in: [Role.IT_PERSON, Role.USER],
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await prisma.user.delete({
            where: { id: user.id },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'USER_DELETED',
                details: `Admin deleted ${user.role}: ${user.username}`,
                userId: req.user!.userId,
            },
        });

        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting user' });
    }
}; 