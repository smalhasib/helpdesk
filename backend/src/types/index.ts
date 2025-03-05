import { Role, BusinessType, TicketPriority, TicketCategory } from '@prisma/client';

export interface User {
    id: number;
    username: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    location: string | null;
    businessType: BusinessType | null;
}

export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: TicketPriority;
    category: TicketCategory;
    ipAddress: string | null;
    deviceName: string | null;
    userId: number;
    assignedTo: number | null;
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date | null;
}

export interface TicketNote {
    id: number;
    note: string;
    ticketId: number;
    addedById: number;
    createdAt: Date;
}

export interface AuditLog {
    id: number;
    action: string;
    details?: string;
    userId: number;
    createdAt: Date;
}

export interface LoginHistory {
    id: number;
    userId: number;
    ipAddress?: string;
    deviceInfo?: string;
    createdAt: Date;
}

export interface JwtPayload {
    userId: number;
    role: Role;
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    role: Role;
    location?: string;
    businessType?: BusinessType;
}

export interface CreateTicketDto {
    title: string;
    description: string;
    priority?: TicketPriority;
    category: TicketCategory;
    ipAddress?: string;
    deviceName?: string;
}

export interface CreateTicketNoteDto {
    note: string;
}

export interface UpdateTicketStatusDto {
    status: string;
}

export interface FilterTicketsDto {
    from?: Date;
    to?: Date;
    status?: string;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: number;
}

export interface AccountLimits {
    SMALL: number;
    MEDIUM: number;
    LARGE: number;
}

export const ACCOUNT_LIMITS: AccountLimits = {
    SMALL: 300,
    MEDIUM: 700,
    LARGE: 3000
};

export interface DashboardStats {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    totalUsers: number;
    ticketsByPriority: Record<TicketPriority, number>;
    ticketsByCategory: Record<TicketCategory, number>;
    ticketsByStatus: Record<string, number>;
    recentTickets: Ticket[];
    recentUsers: User[];
}

export interface DateRange {
    from: Date;
    to: Date;
} 