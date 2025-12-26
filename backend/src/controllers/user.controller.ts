import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

const userRepository = AppDataSource.getRepository(User);

export const getTechnicians = async (req: AuthRequest, res: Response) => {
    try {
        const technicians = await userRepository.find({
            where: { role: UserRole.TECHNICIAN },
            select: ['id', 'name', 'contact_info', 'role']
        });
        res.json(technicians);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching technicians' });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await userRepository.find({
            select: ['id', 'name', 'contact_info', 'role', 'created_at']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
}
