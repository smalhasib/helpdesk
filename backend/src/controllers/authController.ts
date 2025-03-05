import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserDto } from '@/types/index.js';
import prisma from '@/lib/prisma.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role }: CreateUserDto = req.body;

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

        // Create account for super admin
        if (role === 'SUPER_ADMIN') {
            await prisma.account.create({
                data: {
                    userId: user.id,
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
            });
        }

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'USER_REGISTERED',
                details: `User ${username} registered with role ${role}`,
                userId: user.id,
            },
        });

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if super admin account is expired
        if (user.role === 'SUPER_ADMIN') {
            const account = await prisma.account.findUnique({
                where: { userId: user.id },
            });

            if (account?.expiryDate && account.expiryDate < new Date()) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'EXPIRED' },
                });
                return res.status(401).json({ error: 'Account has expired' });
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        // Create login history
        await prisma.loginHistory.create({
            data: {
                userId: user.id,
                ipAddress: req.ip,
                deviceInfo: req.headers['user-agent'],
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'USER_LOGGED_IN',
                details: `User ${user.username} logged in`,
                userId: user.id,
            },
        });

        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error logging in' });
    }
};

export const logout = async (_req: Request, res: Response) => {
    try {
        // Since we're using JWT, we don't need to do anything server-side
        // The client should remove the token from their storage
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error logging out' });
    }
}; 