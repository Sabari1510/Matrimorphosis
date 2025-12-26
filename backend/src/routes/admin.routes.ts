import { Router, Response } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.middleware';
import { getPendingTechnicians, approveTechnician, rejectTechnician } from '../controllers/admin.controller';
import { UserRole } from '../models/user.model';

const router = Router();

// MANDATORY ROUTE: /admin/dashboard - Admin analytics & technician assignment
// GET /api/admin/dashboard
router.get('/dashboard', authenticateToken, authorizeRoles([UserRole.ADMIN]), (req: AuthRequest, res: Response) => {
    // Return admin dashboard analytics data
    res.json({
        message: 'Admin dashboard analytics',
        user: req.user
    });
});

// Admin-only routes for staff verification
router.get('/pending-technicians', authenticateToken, authorizeRoles([UserRole.ADMIN]), getPendingTechnicians);
router.patch('/approve-technician/:id', authenticateToken, authorizeRoles([UserRole.ADMIN]), approveTechnician);
router.delete('/reject-technician/:id', authenticateToken, authorizeRoles([UserRole.ADMIN]), rejectTechnician);

export default router;
