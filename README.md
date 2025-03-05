# IT Help Desk Ticketing System

A comprehensive ticketing system for managing IT support requests with role-based access control and real-time dashboard.

## Features

- **Role-Based Access Control**

  - System Owner: Full system control
  - Super Admin: Admin management with business type limits
  - Admin: IT Person and User management
  - IT Person: Ticket management and User creation
  - User: Ticket creation and tracking

- **Ticket Management**

  - Create, track, and resolve tickets
  - Priority levels (LOW, MEDIUM, HIGH, URGENT)
  - Categories (HARDWARE, SOFTWARE, NETWORK, ACCESS, OTHER)
  - Status tracking (PENDING, IN_PROGRESS, SOLVED)
  - Ticket notes and history
  - IP Address and Device Name tracking
  - Ticket assignment to IT personnel

- **Dashboard & Analytics**

  - Real-time statistics
  - Ticket distribution by priority/category
  - User activity tracking
  - Historical data analysis
  - Date-based filtering
  - Role-specific dashboard views

- **Security & Performance**
  - JWT authentication
  - Role-based authorization
  - Database query optimization
  - 6-month data archiving
  - Audit logging
  - Login history tracking
  - IP and device tracking

## Tech Stack

- **Backend**
  - Node.js with Express
  - TypeScript
  - Prisma ORM
  - MySQL Database
  - JWT Authentication
  - Swagger API Documentation
  - bcrypt for password hashing

## Prerequisites

- Node.js (v18.18.0 or higher)
- MySQL (v8 or higher)
- npm or yarn
- TypeScript (v5.1.0 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd helpdesk
```

2. Install dependencies:

```bash
cd backend
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL="mysql://user:password@localhost:3306/helpdesk"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

4. Initialize the database:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Create initial system owner:

```bash
npm run init-db
```

## Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Access the API documentation:

```
http://localhost:3000/api-docs
```

## Default Credentials

System Owner:

- Email: systemowner@helpdesk.com
- Password: systemowner123

**Important**: Change these credentials after first login!

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout

### Tickets

- POST `/api/tickets` - Create ticket
- GET `/api/tickets` - Get all tickets
- GET `/api/tickets/:id` - Get ticket by ID
- PATCH `/api/tickets/:id/status` - Update ticket status
- POST `/api/tickets/:id/notes` - Add note to ticket
- GET `/api/tickets/status/:status` - Get tickets by status
- GET `/api/tickets/priority/:priority` - Get tickets by priority
- GET `/api/tickets/category/:category` - Get tickets by category
- POST `/api/tickets/:id/close` - Close ticket
- POST `/api/tickets/:id/reopen` - Reopen ticket
- POST `/api/tickets/:id/assign` - Assign ticket to IT person

### Users

- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user
- GET `/api/users/role/:role` - Get users by role
- GET `/api/users/business-type/:type` - Get users by business type
- GET `/api/users/:id/audit-logs` - Get user audit logs
- GET `/api/users/:id/login-history` - Get user login history

### Dashboard

- GET `/api/dashboard/stats` - Get dashboard statistics
- GET `/api/dashboard/historical` - Get historical statistics

### System Owner

- POST `/api/system/superadmin` - Create super admin
- PUT `/api/system/superadmin/:id/expiry` - Update super admin expiry
- DELETE `/api/system/superadmin/:id` - Delete super admin
- GET `/api/system/reports` - Get system reports

### Super Admin

- POST `/api/superadmin/admin` - Create admin
- DELETE `/api/superadmin/admin/:id` - Delete admin
- GET `/api/superadmin/users` - Get users under super admin
- GET `/api/superadmin/tickets` - Get tickets under super admin
- GET `/api/superadmin/tickets/filter` - Filter tickets by date

### Admin

- POST `/api/admin/user` - Create user
- DELETE `/api/admin/user/:id` - Delete user
- GET `/api/admin/users` - Get users under admin
- GET `/api/admin/tickets` - Get tickets under admin
- GET `/api/admin/tickets/filter` - Filter tickets by date

### IT Person

- POST `/api/it/user` - Create user
- GET `/api/it/tickets` - Get assigned tickets
- PUT `/api/it/tickets/:ticketId/close` - Close ticket
- POST `/api/it/tickets/:ticketId/notes` - Add note to ticket
- POST `/api/it/tickets/raise` - Raise ticket for user

## Business Type Limits

- Small Business: Up to 300 accounts
- Medium Business: Up to 700 accounts
- Large Business: Up to 3000 accounts

## Data Archiving

The system automatically archives data older than 6 months to optimize performance. Archived data includes:

- Tickets
- Audit logs
- Login history

## Database Schema

The system uses Prisma with the following main models:

- User (with roles)
- Ticket (with priorities and categories)
- TicketNote
- AuditLog
- LoginHistory
- Account (for super admin expiry)
- DashboardStats

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
