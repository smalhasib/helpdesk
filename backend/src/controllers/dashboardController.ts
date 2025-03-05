import { Request, Response } from 'express';
import { Role, TicketPriority, TicketCategory } from '@prisma/client';
import { DashboardStats, DateRange } from '@/types/index.js';
import prisma from '@/lib/prisma.js';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const userRole = req.user!.role;
        const { from, to } = req.query as unknown as DateRange;

        let whereClause = {};
        if (from && to) {
            whereClause = {
                createdAt: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            };
        }

        // Get ticket statistics
        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            include: {
                user: true,
                assigned: true,
            },
        });

        // Get user statistics based on role
        let users;
        if (userRole === Role.SUPER_ADMIN) {
            users = await prisma.user.findMany({
                where: {
                    role: {
                        in: [Role.ADMIN, Role.IT_PERSON, Role.USER],
                    },
                },
            });
        } else if (userRole === Role.ADMIN) {
            users = await prisma.user.findMany({
                where: {
                    role: {
                        in: [Role.IT_PERSON, Role.USER],
                    },
                },
            });
        } else {
            users = await prisma.user.findMany({
                where: {
                    role: Role.USER,
                },
            });
        }

        // Calculate statistics
        const stats: DashboardStats = {
            totalTickets: tickets.length,
            openTickets: tickets.filter(t => t.status === 'PENDING').length,
            closedTickets: tickets.filter(t => t.status === 'SOLVED').length,
            totalUsers: users.length,
            ticketsByPriority: {
                LOW: tickets.filter(t => t.priority === TicketPriority.LOW).length,
                MEDIUM: tickets.filter(t => t.priority === TicketPriority.MEDIUM).length,
                HIGH: tickets.filter(t => t.priority === TicketPriority.HIGH).length,
                URGENT: tickets.filter(t => t.priority === TicketPriority.URGENT).length,
            },
            ticketsByCategory: {
                HARDWARE: tickets.filter(t => t.category === TicketCategory.HARDWARE).length,
                SOFTWARE: tickets.filter(t => t.category === TicketCategory.SOFTWARE).length,
                NETWORK: tickets.filter(t => t.category === TicketCategory.NETWORK).length,
                ACCESS: tickets.filter(t => t.category === TicketCategory.ACCESS).length,
                OTHER: tickets.filter(t => t.category === TicketCategory.OTHER).length,
            },
            ticketsByStatus: tickets.reduce((acc, ticket) => {
                acc[ticket.status] = (acc[ticket.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            recentTickets: tickets
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5),
            recentUsers: users
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5),
        };

        // Save dashboard stats
        await prisma.dashboardStats.create({
            data: {
                userId,
                totalTickets: stats.totalTickets,
                openTickets: stats.openTickets,
                closedTickets: stats.closedTickets,
                totalUsers: stats.totalUsers,
            },
        });

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
};

export const getHistoricalStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { from, to } = req.query as unknown as DateRange;

        const stats = await prisma.dashboardStats.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        res.json(stats);
    } catch (error) {
        console.error('Error fetching historical stats:', error);
        res.status(500).json({ error: 'Error fetching historical statistics' });
    }
}; 