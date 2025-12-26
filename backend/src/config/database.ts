import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/user.model';
import { Request } from '../models/request.model';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'maintenance_tracker',
    synchronize: false, // Disabled - using manual schema from schema.sql
    logging: false,
    entities: [User, Request],
    subscribers: [],
    migrations: [],
});
