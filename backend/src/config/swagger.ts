import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IT Help Desk API Documentation',
            version: '1.0.0',
            description: 'API documentation for the IT Help Desk Ticketing System',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
            },
            {
                url: 'http://127.0.0.1:3000',
                description: 'Alternative local server',
            },
            {
                url: 'http://0.0.0.0:3000',
                description: 'Docker container server',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 