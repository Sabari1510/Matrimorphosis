import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getTechnicians, getAllUsers, getTechniciansBySpecialization, getAllTechnicians, getPendingTechnicians, verifyTechnician } from '../controllers/user.controller';
import { UserRole } from '../models/user.model';

const router = Router();

// Get verified technicians (for assignment purposes)
router.get('/technicians', authenticateToken, authorizeRoles([UserRole.ADMIN]), getTechnicians);

// Get ALL technicians including pending (for admin manage staff page)
router.get('/technicians/all', authenticateToken, authorizeRoles([UserRole.ADMIN]), getAllTechnicians);

// Get pending technicians for review
router.get('/technicians/pending', authenticateToken, authorizeRoles([UserRole.ADMIN]), getPendingTechnicians);

// Verify a technician
router.put('/technicians/:id/verify', authenticateToken, authorizeRoles([UserRole.ADMIN]), verifyTechnician);

// Get technicians by specialization (Admin assignment filtering)
router.get('/technicians/specialization/:specialization', authenticateToken, authorizeRoles([UserRole.ADMIN]), getTechniciansBySpecialization);

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles([UserRole.ADMIN]), getAllUsers);

export default router;
