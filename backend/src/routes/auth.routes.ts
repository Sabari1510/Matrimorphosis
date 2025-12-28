import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { upload } from '../config/upload';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { validateRegistration, validateLogin } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact_info
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               contact_info:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secure123
 *               role:
 *                 type: string
 *                 enum: [Resident, Technician]
 *                 default: Resident
 *               phone:
 *                 type: string
 *                 example: +91 98765 43210
 *               employee_id:
 *                 type: string
 *                 description: Required for technicians
 *               specialization:
 *                 type: string
 *                 description: Required for technicians
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo for technicians
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error or user exists
 *       429:
 *         description: Too many registration attempts
 */
router.post('/register', authLimiter, upload.single('photo'), validateRegistration, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact_info
 *               - password
 *             properties:
 *               contact_info:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secure123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account pending verification
 *       429:
 *         description: Too many login attempts
 */
router.post('/login', authLimiter, validateLogin, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact_info
 *             properties:
 *               contact_info:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset code generated (in dev mode returns token)
 *       400:
 *         description: Email is required
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact_info
 *               - token
 *               - password
 *             properties:
 *               contact_info:
 *                 type: string
 *                 example: john@example.com
 *               token:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: newSecure123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', authLimiter, resetPassword);

export default router;


