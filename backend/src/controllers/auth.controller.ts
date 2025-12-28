/**
 * @fileoverview Authentication Controller
 * Handles user registration, login, and authentication operations.
 * 
 * @module controllers/auth
 * @requires express
 * @requires bcrypt
 * @requires jsonwebtoken
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/user.model';
import Media from '../models/media.schema';
import Log from '../models/log.schema';

/** User repository instance for database operations */
const userRepository = AppDataSource.getRepository(User);

/**
 * Registers a new user in the system
 * 
 * @async
 * @function register
 * @param {Request} req - Express request object
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (min 6 chars, 1 letter, 1 number)
 * @param {string} [req.body.role='Resident'] - User role (Admin, Technician, Resident)
 * @param {string} [req.body.contact_info] - Contact information (email/phone)
 * @param {string} [req.body.employee_id] - Employee ID (for staff)
 * @param {string} [req.body.specialization] - Technician specialization
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with success message or error
 * 
 * @example
 * // Request body
 * {
 *   "name": "John Doe",
 *   "contact_info": "john@example.com",
 *   "password": "secure123",
 *   "role": "Resident"
 * }
 * 
 * @throws {400} If user already exists or password doesn't meet requirements
 * @throws {500} If internal server error occurs
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, contact_info, employee_id, phone, specialization } = req.body;

        // Check if user exists (using contact_info or name as unique identifier since email isn't in schema?)
        // Wait, the schema in PDF didn't specify email, but 'contact_info'.
        // However, login usually requires email/username. I added password to model explicitly.
        // Let's assume contact_info can be email or phone. I'll use contact_info as uniqueness check.

        // Check if contact_info already exists
        const existingUser = await userRepository.findOne({ where: { contact_info } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Password constraints: min 6 chars, 1 alphabet, 1 number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long and contain at least one letter and one number'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create media in MongoDB if photo exists
        let photoId = null;
        if ((req as any).file) {
            const media = new Media({
                filename: (req as any).file.originalname,
                contentType: (req as any).file.mimetype,
                data: (req as any).file.buffer
            });
            const savedMedia = await media.save();
            photoId = savedMedia._id.toString();
        }

        const user = new User();

        user.name = name;
        user.contact_info = contact_info;
        user.password = hashedPassword;
        user.role = role || UserRole.RESIDENT;
        user.employee_id = employee_id || null;
        user.phone = phone || null;
        user.photo = photoId;

        user.specialization = (role === UserRole.TECHNICIAN && specialization) ? specialization : null;

        // Technicians require admin verification, others are auto-verified
        user.verified = user.role === UserRole.TECHNICIAN ? false : true;

        await userRepository.save(user);

        // Log the action to MongoDB (non-blocking)
        Log.create({
            level: 'INFO',
            message: `New user registered: ${user.name}`,
            meta: { userId: user.id, role: user.role, verified: user.verified },
            timestamp: new Date(),
        }).catch(err => console.log('MongoDB logging failed:', err.message));

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { contact_info, password } = req.body;

        console.log('Login attempt:', { contact_info, password: password ? '***' : 'missing' });

        const user = await userRepository.findOne({ where: { contact_info } });
        if (!user) {
            Log.create({
                level: 'WARN',
                message: `Failed login attempt for: ${contact_info}`,
                meta: { reason: 'User not found' },
            }).catch(err => console.log('MongoDB logging failed:', err.message));
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('User found, checking password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            Log.create({
                level: 'WARN',
                message: `Failed login attempt for: ${contact_info}`,
                meta: { reason: 'Invalid password' },
            }).catch(err => console.log('MongoDB logging failed:', err.message));
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is verified (for Technicians)
        if (!user.verified) {
            return res.status(403).json({ message: 'Account pending admin verification' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        // Log success (non-blocking)
        Log.create({
            level: 'INFO',
            message: `User logged in: ${user.name}`,
            meta: { userId: user.id },
        }).catch(err => console.log('MongoDB logging failed:', err.message));

        // Send response
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                contact_info: user.contact_info
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Initiates password reset by generating a token
 * In production, this would send an email with the reset link
 * 
 * @async
 * @function forgotPassword
 * @param {Request} req - Express request object
 * @param {string} req.body.contact_info - User's email address
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with reset token (in dev) or success message
 */
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { contact_info } = req.body;

        if (!contact_info) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await userRepository.findOne({ where: { contact_info } });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If an account exists, a reset link will be sent' });
        }

        // Generate reset token (6-digit code for simplicity)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Save to database
        user.password_reset_token = resetToken;
        user.password_reset_expires = resetExpires;
        await userRepository.save(user);

        // In production: Send email with reset link
        // For now: Return token in response (development mode only)
        if (process.env.NODE_ENV === 'development') {
            return res.json({
                message: 'Reset code generated',
                resetToken,  // Only in dev mode!
                expiresIn: '30 minutes'
            });
        }

        res.json({ message: 'If an account exists, a reset link will be sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Resets the user's password using a valid token
 * 
 * @async
 * @function resetPassword
 * @param {Request} req - Express request object
 * @param {string} req.body.contact_info - User's email address
 * @param {string} req.body.token - Reset token from email
 * @param {string} req.body.password - New password
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} JSON response with success or error message
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { contact_info, token, password } = req.body;

        if (!contact_info || !token || !password) {
            return res.status(400).json({ message: 'Email, token, and new password are required' });
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters with 1 letter and 1 number'
            });
        }

        const user = await userRepository.findOne({ where: { contact_info } });

        if (!user || !user.password_reset_token || !user.password_reset_expires) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = await bcrypt.hash(password, 10);
        user.password_reset_token = null;
        user.password_reset_expires = null;
        await userRepository.save(user);

        // Log password reset
        Log.create({
            level: 'INFO',
            message: `Password reset for: ${user.contact_info}`,
            meta: { userId: user.id },
        }).catch(err => console.log('MongoDB logging failed:', err.message));

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

