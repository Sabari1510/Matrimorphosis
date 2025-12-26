import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import connectMongo from './config/mongo';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Database Initialization
const initializeDatabases = async () => {
  try {
    // Connect to MySQL
    await AppDataSource.initialize();
    console.log('MySQL Database Connected Successfully');

    // Connect to MongoDB
    await connectMongo();
  } catch (error) {
    console.error('Database Connection Error:', error);
    process.exit(1);
  }
};

initializeDatabases();

import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import technicianRoutes from './routes/technician.routes';
import mediaRoutes from './routes/media.routes';

// Route mappings matching specification
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', requestRoutes);  // MANDATORY: /maintenance/new, /maintenance/history
app.use('/api/technician', technicianRoutes); // MANDATORY: /technician/dashboard
app.use('/api/admin', adminRoutes);           // MANDATORY: /admin/dashboard
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// Routes Placeholder
app.get('/', (req: Request, res: Response) => {
  res.send('Digital Maintenance Tracker API is running');
});

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
