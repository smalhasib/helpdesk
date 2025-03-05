import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function archiveData() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Archive tickets
        const oldTickets = await prisma.ticket.findMany({
            where: {
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
            include: {
                notes: true,
            },
        });

        for (const ticket of oldTickets) {
            await prisma.archivedData.create({
                data: {
                    tableName: 'Ticket',
                    data: ticket,
                },
            });
        }

        // Archive audit logs
        const oldAuditLogs = await prisma.auditLog.findMany({
            where: {
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
        });

        for (const log of oldAuditLogs) {
            await prisma.archivedData.create({
                data: {
                    tableName: 'AuditLog',
                    data: log,
                },
            });
        }

        // Archive login history
        const oldLoginHistory = await prisma.loginHistory.findMany({
            where: {
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
        });

        for (const login of oldLoginHistory) {
            await prisma.archivedData.create({
                data: {
                    tableName: 'LoginHistory',
                    data: login,
                },
            });
        }

        // Delete archived data from main tables
        await prisma.ticket.deleteMany({
            where: {
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
        });

        await prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
        });

        await prisma.loginHistory.deleteMany({
            where: {
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
        });

        console.log('Data archiving completed successfully');
    } catch (error) {
        console.error('Error archiving data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

archiveData(); 