import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { createRequest, getRequests, updateStatus, assignTechnician, resolveRequest, submitFeedback, deleteRequest } from '../controllers/request.controller';
import { getComments, addComment } from '../controllers/comment.controller';
import { UserRole } from '../models/user.model';
import { upload } from '../config/upload';
import { validateRequest, validateFeedback, validateIdParam } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/maintenance/new:
 *   post:
 *     summary: Submit a new maintenance request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - priority
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: Leaking Faucet
 *               description:
 *                 type: string
 *                 example: Kitchen faucet is dripping water constantly
 *               category:
 *                 type: string
 *                 enum: [plumbing, electrical, hvac, appliance, structural, other]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               location:
 *                 type: string
 *                 example: Tower A - Room 101
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Photo of the issue
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/new', authenticateToken, authorizeRoles([UserRole.RESIDENT, UserRole.ADMIN]), upload.single('media'), validateRequest, createRequest);

/**
 * @swagger
 * /api/maintenance/history:
 *   get:
 *     summary: Get maintenance request history
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     description: Returns requests based on user role. Residents see their own, Technicians see assigned, Admins see all.
 *     responses:
 *       200:
 *         description: List of maintenance requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MaintenanceRequest'
 *       401:
 *         description: Unauthorized
 */
router.get('/history', authenticateToken, getRequests);

/**
 * @swagger
 * /api/maintenance/{id}/status:
 *   patch:
 *     summary: Update request status
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [In-Progress, Resolved]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.patch('/:id/status', authenticateToken, authorizeRoles([UserRole.TECHNICIAN, UserRole.ADMIN]), validateIdParam, updateStatus);

/**
 * @swagger
 * /api/maintenance/{id}/assign:
 *   patch:
 *     summary: Assign technician to request (Admin only)
 *     tags: [Requests, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               technician_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Technician assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Request or technician not found
 */
router.patch('/:id/assign', authenticateToken, authorizeRoles([UserRole.ADMIN]), validateIdParam, assignTechnician);

/**
 * @swagger
 * /api/maintenance/{id}/resolve:
 *   patch:
 *     summary: Mark request as resolved with completion proof
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               completion_media:
 *                 type: string
 *                 format: binary
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request resolved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.patch('/:id/resolve', authenticateToken, authorizeRoles([UserRole.TECHNICIAN, UserRole.ADMIN]), upload.single('completion_media'), validateIdParam, resolveRequest);

/**
 * @swagger
 * /api/maintenance/{id}/feedback:
 *   patch:
 *     summary: Submit feedback for resolved request (Resident only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback_rating
 *             properties:
 *               feedback_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               feedback_comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid rating value
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/feedback', authenticateToken, authorizeRoles([UserRole.RESIDENT]), validateIdParam, validateFeedback, submitFeedback);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   delete:
 *     summary: Delete a maintenance request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.delete('/:id', authenticateToken, validateIdParam, deleteRequest);

/**
 * @swagger
 * /api/maintenance/{id}/comments:
 *   get:
 *     summary: Get comments for a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 */
router.get('/:id/comments', authenticateToken, validateIdParam, getComments);

/**
 * @swagger
 * /api/maintenance/{id}/comments:
 *   post:
 *     summary: Add a comment to a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Can you provide more details about the issue?
 *     responses:
 *       201:
 *         description: Comment added
 *       400:
 *         description: Message is required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 */
router.post('/:id/comments', authenticateToken, validateIdParam, addComment);

export default router;


