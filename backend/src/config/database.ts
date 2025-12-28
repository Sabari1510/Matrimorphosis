import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/user.model';
import { Request } from '../models/request.model';
import { Comment } from '../models/comment.model';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'maintenance_tracker',
    synchronize: true, // Temporarily enabled to create new columns
    logging: false,
    entities: [User, Request, Comment],
    subscribers: [],
    migrations: [],
});
