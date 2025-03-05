import { Request, Response } from 'express';
import { Role, BusinessType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from '@/types/index.js';
import prisma from '@/lib/prisma.js';

export const createSuperAdmin = async (req: Request, res: Response) => {
    try {
        const { username, email, password, location, businessType }: CreateUserDto = req.body;

        // Validate business type
        if (!businessType || !Object.values(BusinessType).includes(businessType)) {
            return res.status(400).json({ error: 'Valid business type is required' });
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

        // Create super admin user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: Role.SUPER_ADMIN,
                location,
                businessType,
            },
        });

        // Create account with expiry date
        await prisma.account.create({
            data: {
                userId: user.id,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'SUPER_ADMIN_CREATED',
                details: `System Owner created Super Admin: ${username} with business type ${businessType}`,
                userId: req.user!.userId,
            },
        });

        return res.status(201).json({
            message: 'Super Admin created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                location: user.location,
                businessType: user.businessType,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error creating Super Admin' });
    }
};

export const updateSuperAdminExpiry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { expiryDate } = req.body;

        // Check if user exists and is a super admin
        const user = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: Role.SUPER_ADMIN,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Super Admin not found' });
        }

        // Update account expiry date
        await prisma.account.update({
            where: { userId: user.id },
            data: { expiryDate: new Date(expiryDate) },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'SUPER_ADMIN_EXPIRY_UPDATED',
                details: `System Owner updated Super Admin ${user.username} expiry date`,
                userId: req.user!.userId,
            },
        });

        return res.json({ message: 'Super Admin expiry date updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error updating Super Admin expiry date' });
    }
};

export const deleteSuperAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if user exists and is a super admin
        const user = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: Role.SUPER_ADMIN,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Super Admin not found' });
        }

        // Delete account first (due to foreign key constraint)
        await prisma.account.delete({
            where: { userId: user.id },
        });

        // Delete user
        await prisma.user.delete({
            where: { id: user.id },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                action: 'SUPER_ADMIN_DELETED',
                details: `System Owner deleted Super Admin: ${user.username}`,
                userId: req.user!.userId,
            },
        });

        return res.json({ message: 'Super Admin deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting Super Admin' });
    }
};

export const getSystemReports = async (_req: Request, res: Response) => {
    try {
        // Get total users by role and business type
        const usersByRoleAndBusiness = await prisma.user.groupBy({
            by: ['role', 'businessType'],
            _count: true,
            where: {
                role: Role.SUPER_ADMIN,
            },
        });

        // Get total tickets by status
        const ticketsByStatus = await prisma.ticket.groupBy({
            by: ['status'],
            _count: true,
        });

        // Get recent audit logs
        const recentAuditLogs = await prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        role: true,
                    },
                },
            },
        });

        // Get recent login history
        const recentLoginHistory = await prisma.loginHistory.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        role: true,
                    },
                },
            },
        });

        // Get super admin account statuses
        const superAdminAccounts = await prisma.user.findMany({
            where: { role: Role.SUPER_ADMIN },
            select: {
                id: true,
                username: true,
                businessType: true,
                location: true,
                account: {
                    select: {
                        expiryDate: true,
                    },
                },
            },
        });

        return res.json({
            usersByRoleAndBusiness,
            ticketsByStatus,
            recentAuditLogs,
            recentLoginHistory,
            superAdminAccounts,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching system reports' });
    }
}; 