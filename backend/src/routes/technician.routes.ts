import { Router, Response } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.middleware';
import { getTechnicians, getAllUsers } from '../controllers/user.controller';
import { UserRole } from '../models/user.model';

const router = Router();

// MANDATORY ROUTE: /technician/dashboard - Technician task management
// This route provides data for the technician dashboard
// GET /api/technician/dashboard
router.get('/dashboard', authenticateToken, authorizeRoles([UserRole.TECHNICIAN, UserRole.ADMIN]), (req: AuthRequest, res: Response) => {
    // Return technician-specific dashboard data
    res.json({
        message: 'Technician dashboard data',
        user: req.user
    });
});

// Additional technician routes
router.get('/', authenticateToken, authorizeRoles([UserRole.ADMIN]), getTechnicians);

export default router;
