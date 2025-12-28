import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

const userRepository = AppDataSource.getRepository(User);

/**
 * Get all verified technicians (for assignment purposes)
 */
export const getTechnicians = async (req: AuthRequest, res: Response) => {
    try {
        const technicians = await userRepository.find({
            where: { role: UserRole.TECHNICIAN, verified: true },
            select: ['id', 'name', 'contact_info', 'role', 'specialization', 'employee_id', 'phone', 'photo']
        });
        res.json(technicians);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching technicians' });
    }
};

/**
 * Get ALL technicians including pending (for admin manage staff page)
 */
export const getAllTechnicians = async (req: AuthRequest, res: Response) => {
    try {
        const technicians = await userRepository.find({
            where: { role: UserRole.TECHNICIAN },
            select: ['id', 'name', 'contact_info', 'role', 'specialization', 'employee_id', 'phone', 'photo', 'verified', 'created_at']
        });
        res.json(technicians);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching technicians' });
    }
};

/**
 * Get pending (unverified) technicians for admin review
 */
export const getPendingTechnicians = async (req: AuthRequest, res: Response) => {
    try {
        const pendingTechs = await userRepository.find({
            where: { role: UserRole.TECHNICIAN, verified: false },
            select: ['id', 'name', 'contact_info', 'specialization', 'employee_id', 'phone', 'photo', 'created_at']
        });
        res.json(pendingTechs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pending technicians' });
    }
};

/**
 * Verify (approve) a technician
 */
export const verifyTechnician = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id!, 10);
        const user = await userRepository.findOne({ where: { id, role: UserRole.TECHNICIAN } });

        if (!user) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        user.verified = true;
        await userRepository.save(user);

        res.json({ message: 'Technician verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying technician' });
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

export const getTechniciansBySpecialization = async (req: AuthRequest, res: Response) => {
    try {
        const { specialization } = req.params;

        const technicians = await userRepository.find({
            where: {
                role: UserRole.TECHNICIAN,
                specialization: specialization as string,
                verified: true // Only return verified technicians
            },
            select: ['id', 'name', 'contact_info', 'specialization', 'employee_id']
        });

        res.json(technicians);
    } catch (error) {
        console.error('Error fetching technicians by specialization:', error);
        res.status(500).json({ message: 'Error fetching technicians' });
    }
};
