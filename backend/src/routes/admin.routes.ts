import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getPendingTechnicians, approveTechnician, rejectTechnician } from '../controllers/admin.controller';
import { UserRole } from '../models/user.model';

const router = Router();

// Admin-only routes for staff verification
router.get('/pending-technicians', authenticateToken, authorizeRoles([UserRole.ADMIN]), getPendingTechnicians);
router.patch('/approve-technician/:id', authenticateToken, authorizeRoles([UserRole.ADMIN]), approveTechnician);
router.delete('/reject-technician/:id', authenticateToken, authorizeRoles([UserRole.ADMIN]), rejectTechnician);

export default router;
