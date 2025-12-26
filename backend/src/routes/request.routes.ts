import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { createRequest, getRequests, updateStatus, assignTechnician } from '../controllers/request.controller';
import { UserRole } from '../models/user.model';
import { upload } from '../config/upload';

const router = Router();

// Resident Routes - with file upload
router.post('/', authenticateToken, authorizeRoles([UserRole.RESIDENT]), upload.single('media'), createRequest);

// Shared Routes (Resident sees own, Tech sees assigned, Admin sees all)
router.get('/', authenticateToken, getRequests);

// Technician/Admin Routes
router.patch('/:id/status', authenticateToken, authorizeRoles([UserRole.TECHNICIAN, UserRole.ADMIN]), updateStatus);

// Admin Routes
router.patch('/:id/assign', authenticateToken, authorizeRoles([UserRole.ADMIN]), assignTechnician);

export default router;
