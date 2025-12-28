import { Router, Response } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.middleware';
import { getPendingTechnicians, approveTechnician, rejectTechnician, deleteStaff } from '../controllers/admin.controller';
import { getDashboardStats, getTechnicianStats } from '../controllers/analytics.controller';
import { UserRole } from '../models/user.model';

const router = Router();

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data including counts by status, category, trends
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/analytics', authenticateToken, authorizeRoles([UserRole.ADMIN]), getDashboardStats);

/**
 * @swagger
 * /api/admin/technician-stats:
 *   get:
 *     summary: Get technician performance stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technician stats with assigned, resolved, and ratings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/technician-stats', authenticateToken, authorizeRoles([UserRole.ADMIN]), getTechnicianStats);

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
router.delete('/staff/:id', authenticateToken, authorizeRoles([UserRole.ADMIN]), deleteStaff);

export default router;

