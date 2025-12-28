/**
 * @fileoverview Input Validation Middleware
 * Provides validation functions for request body, params, and query.
 * 
 * @module middleware/validation
 */

import { Request, Response, NextFunction } from 'express';
import { BadRequestError, ValidationError } from './error.middleware';
import { PASSWORD_REGEX, EMAIL_REGEX, PHONE_REGEX } from '../utils/constants';

/**
 * Validation result interface
 */
interface ValidationResult {
    isValid: boolean;
    errors: { field: string; message: string }[];
}

/**
 * Validate registration input
 */
export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const { name, contact_info, password, role } = req.body;
    const errors: { field: string; message: string }[] = [];

    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    // Contact info (email) validation
    if (!contact_info) {
        errors.push({ field: 'contact_info', message: 'Email is required' });
    } else if (!EMAIL_REGEX.test(contact_info)) {
        errors.push({ field: 'contact_info', message: 'Please provide a valid email address' });
    }

    // Password validation
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (!PASSWORD_REGEX.test(password)) {
        errors.push({
            field: 'password',
            message: 'Password must be at least 6 characters with 1 letter and 1 number'
        });
    }

    // Role validation (optional, defaults to Resident)
    const validRoles = ['Admin', 'Technician', 'Resident'];
    if (role && !validRoles.includes(role)) {
        errors.push({ field: 'role', message: 'Invalid role. Must be Admin, Technician, or Resident' });
    }

    if (errors.length > 0) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors
        });
        return;
    }

    next();
};

/**
 * Validate login input
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { contact_info, password } = req.body;
    const errors: { field: string; message: string }[] = [];

    if (!contact_info) {
        errors.push({ field: 'contact_info', message: 'Email is required' });
    }

    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length > 0) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors
        });
        return;
    }

    next();
};

/**
 * Validate maintenance request input
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const fs = require('fs');
    fs.appendFileSync('debug_logs.txt', `\n[${new Date().toISOString()}] Validating body: ${JSON.stringify(req.body)}\n`);
    const { title, category, description, priority } = req.body;
    const errors: { field: string; message: string }[] = [];

    if (!title || title.trim().length < 3) {
        errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    }

    if (!category) {
        errors.push({ field: 'category', message: 'Category is required' });
    }

    if (!description || description.trim().length < 5) {
        errors.push({ field: 'description', message: 'Description must be at least 5 characters' });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!priority || !validPriorities.includes(priority.toLowerCase())) {
        errors.push({ field: 'priority', message: 'Priority must be low, medium, high, or urgent' });
    }

    if (errors.length > 0) {
        console.warn('[Validation Error]', { body: req.body, errors });
        res.status(422).json({
            success: false,
            message: 'Validation failed: ' + errors.map(e => `${e.field}: ${e.message}`).join('; '),
            errors
        });
        return;
    }

    next();
};

/**
 * Validate feedback input
 */
export const validateFeedback = (req: Request, res: Response, next: NextFunction): void => {
    const { feedback_rating } = req.body;
    const errors: { field: string; message: string }[] = [];

    if (!feedback_rating) {
        errors.push({ field: 'feedback_rating', message: 'Rating is required' });
    } else {
        const rating = parseInt(feedback_rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            errors.push({ field: 'feedback_rating', message: 'Rating must be between 1 and 5' });
        }
    }

    if (errors.length > 0) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors
        });
        return;
    }

    next();
};

/**
 * Validate ID parameter
 */
export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
            success: false,
            message: 'Invalid ID parameter'
        });
        return;
    }

    next();
};

/**
 * Sanitize string input - removes HTML tags and trims whitespace
 */
export const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove remaining angle brackets
        .trim();
};

/**
 * Middleware to sanitize all string fields in request body
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        }
    }
    next();
};
