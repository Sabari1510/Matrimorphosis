import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/user.model';
import Media from '../models/media.schema';
import Log from '../models/log.schema';

const userRepository = AppDataSource.getRepository(User);

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
            console.log('User not found:', contact_info);
            // Log failed attempt (non-blocking)
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

        // Log success (non-blocking - don't wait for MongoDB)
        Log.create({
            level: 'INFO',
            message: `User logged in: ${user.name}`,
            meta: { userId: user.id },
        }).catch(err => console.log('MongoDB logging failed:', err.message));

        // Send response immediately
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, contact_info: user.contact_info } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
