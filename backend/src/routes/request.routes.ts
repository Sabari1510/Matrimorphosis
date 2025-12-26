import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { createRequest, getRequests, updateStatus, assignTechnician, resolveRequest, submitFeedback, deleteRequest } from '../controllers/request.controller';
import { UserRole } from '../models/user.model';
import { upload } from '../config/upload';

const router = Router();

// MANDATORY ROUTE: /maintenance/new - Submit new maintenance request
// POST /api/maintenance/new
router.post('/new', authenticateToken, authorizeRoles([UserRole.RESIDENT, UserRole.ADMIN]), upload.single('media'), createRequest);

// MANDATORY ROUTE: /maintenance/history - View past requests
// GET /api/maintenance/history
router.get('/history', authenticateToken, getRequests);

// Additional maintenance routes
router.patch('/:id/status', authenticateToken, authorizeRoles([UserRole.TECHNICIAN, UserRole.ADMIN]), updateStatus);
router.patch('/:id/assign', authenticateToken, authorizeRoles([UserRole.ADMIN]), assignTechnician);
router.patch('/:id/resolve', authenticateToken, authorizeRoles([UserRole.TECHNICIAN, UserRole.ADMIN]), upload.single('completion_media'), resolveRequest);
router.patch('/:id/feedback', authenticateToken, authorizeRoles([UserRole.RESIDENT]), submitFeedback);
router.delete('/:id', authenticateToken, deleteRequest);

export default router;
