/**
 * @fileoverview Express Server Configuration
 * Main entry point for the Digital Maintenance Tracker API.
 * 
 * @module server
 * @requires express
 * @requires cors
 * @requires dotenv
 */

import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import connectMongo from './config/mongo';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { sanitizeBody } from './middleware/validation.middleware';

// Import config
import { setupSwagger } from './config/swagger';
import { validateEnv } from './config/env.validation';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app: Express = express();
const port = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitize all incoming request bodies
app.use(sanitizeBody);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Setup Swagger API documentation
setupSwagger(app);

// ============================================
// DATABASE INITIALIZATION
// ============================================

/**
 * Initializes database connections (MySQL and MongoDB)
 * Exits process on connection failure
 */
const initializeDatabases = async (): Promise<void> => {
  try {
    // Connect to MySQL
    await AppDataSource.initialize();
    console.log('✅ MySQL Database Connected Successfully');

    // Connect to MongoDB
    await connectMongo();
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
    process.exit(1);
  }
};

initializeDatabases();

// ============================================
// ROUTE IMPORTS
// ============================================

import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import technicianRoutes from './routes/technician.routes';
import mediaRoutes from './routes/media.routes';

// ============================================
// ROUTE MAPPINGS
// ============================================

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Digital Maintenance Tracker API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    docs: '/api-docs'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', requestRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last middleware
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

app.listen(port, () => {
  console.log(`\n🚀 Server is running at http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - Auth:        /api/auth`);
  console.log(`   - Maintenance: /api/maintenance`);
  console.log(`   - Technician:  /api/technician`);
  console.log(`   - Admin:       /api/admin`);
  console.log(`   - Users:       /api/users`);
  console.log(`   - Media:       /api/media\n`);
});

export default app;

