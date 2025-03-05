import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger.js';
import { logger } from '@config/logger.js';
import authRoutes from '@routes/authRoutes.js';
import ticketRoutes from '@routes/ticketRoutes.js';
import userRoutes from '@routes/userRoutes.js';
import dashboardRoutes from '@routes/dashboardRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Global logger middleware - should be one of the first middleware
app.use(logger);

// Basic route for testing
app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to IT Help Desk API' });
});

// Swagger Documentation - Place this before any authentication middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
