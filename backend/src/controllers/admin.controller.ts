import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

const userRepository = AppDataSource.getRepository(User);

// Get all pending technicians (unverified)
export const getPendingTechnicians = async (req: AuthRequest, res: Response) => {
    try {
        const pendingTechs = await userRepository.find({
            where: { role: 'Technician' as any, verified: false },
            select: ['id', 'name', 'contact_info', 'created_at']
        });

        res.json(pendingTechs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pending technicians' });
    }
};

// Approve a technician
export const approveTechnician = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Technician ID is required' });
        }

        const technician = await userRepository.findOne({ where: { id: parseInt(id) } });

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        technician.verified = true;
        await userRepository.save(technician);

        res.json({ message: 'Technician approved successfully', technician });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error approving technician' });
    }
};

// Reject a technician (delete account)
export const rejectTechnician = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Technician ID is required' });
        }

        await userRepository.delete(parseInt(id));

        res.json({ message: 'Technician rejected and account deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error rejecting technician' });
    }
};
