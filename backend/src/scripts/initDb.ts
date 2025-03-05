import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        // Check if system owner already exists
        const existingSystemOwner = await prisma.user.findFirst({
            where: { role: Role.SYSTEM_OWNER }
        });

        if (existingSystemOwner) {
            console.log('System owner already exists');
            return;
        }

        // Create system owner user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('systemowner123', salt);

        const systemOwner = await prisma.user.create({
            data: {
                username: 'systemowner',
                email: 'systemowner@helpdesk.com',
                password: hashedPassword,
                role: Role.SYSTEM_OWNER
            }
        });

        console.log('System owner created successfully:', {
            id: systemOwner.id,
            username: systemOwner.username,
            email: systemOwner.email,
            role: systemOwner.role
        });

        console.log('\nDefault credentials:');
        console.log('Email: systemowner@helpdesk.com');
        console.log('Password: systemowner123');
        console.log('\nPlease change these credentials after first login!');
    } catch (error) {
        console.error('Error creating system owner:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 