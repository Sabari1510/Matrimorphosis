/**
 * @fileoverview Swagger API Documentation Configuration
 * Provides OpenAPI 3.0 documentation for the Maintenance Tracker API
 * 
 * @module config/swagger
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Maintenance Tracker API',
            version: '1.0.0',
            description: `
## Apartment Maintenance Tracking System API

This API provides endpoints for managing maintenance requests in an apartment complex.

### Features:
- **User Authentication** - Register and login with JWT tokens
- **Maintenance Requests** - Create, read, update, delete requests
- **Technician Management** - Admin can assign and verify technicians
- **Feedback System** - Residents can rate completed work

### Authentication:
All protected endpoints require a Bearer JWT token in the Authorization header.
            `,
            contact: {
                name: 'Maintenance Tracker Support',
                email: 'support@maintenance.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'John Doe' },
                        contact_info: { type: 'string', example: 'john@example.com' },
                        role: { type: 'string', enum: ['Resident', 'Technician', 'Admin'] },
                        phone: { type: 'string', example: '+91 98765 43210' },
                        specialization: { type: 'string', example: 'electrical' },
                        verified: { type: 'boolean', example: true }
                    }
                },
                MaintenanceRequest: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'Leaking Faucet' },
                        description: { type: 'string', example: 'Kitchen faucet is leaking water' },
                        category: { type: 'string', example: 'plumbing' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                        status: { type: 'string', enum: ['New', 'Assigned', 'In-Progress', 'Resolved'] },
                        location: { type: 'string', example: 'Tower A - Room 101' },
                        resident_id: { type: 'integer', example: 1 },
                        technician_id: { type: 'integer', example: 2 },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Error message' },
                        statusCode: { type: 'integer', example: 400 }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Operation successful' }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User registration and login' },
            { name: 'Requests', description: 'Maintenance request operations' },
            { name: 'Users', description: 'User and technician management' },
            { name: 'Admin', description: 'Admin-only operations' }
        ]
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Sets up Swagger UI at /api-docs endpoint
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Maintenance Tracker API Docs'
    }));

    // JSON spec endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📚 Swagger docs available at /api-docs');
};

export default swaggerSpec;
