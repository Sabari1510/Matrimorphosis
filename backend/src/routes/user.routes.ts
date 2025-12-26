import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getTechnicians, getAllUsers } from '../controllers/user.controller';
import { UserRole } from '../models/user.model';

const router = Router();

// Get all technicians (Admin can assign them)
router.get('/technicians', authenticateToken, authorizeRoles([UserRole.ADMIN]), getTechnicians);

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles([UserRole.ADMIN]), getAllUsers);

export default router;
