/**
 * @fileoverview Rate Limiting Middleware
 * Protects API endpoints from brute force and DDoS attacks
 * 
 * @module middleware/rate-limit
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login, register)
 * More restrictive to prevent brute force attacks
 * 
 * Limit: 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        message: 'Too many authentication attempts, please try again after 15 minutes',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiter for general API endpoints
 * Less restrictive for normal API usage
 * 
 * Limit: 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        message: 'Too many requests, please try again later',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for sensitive operations
 * Very restrictive for operations like password reset
 * 
 * Limit: 3 requests per hour
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: {
        message: 'Too many attempts, please try again after an hour',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
});
