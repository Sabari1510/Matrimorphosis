/**
 * @fileoverview Centralized Error Handling Middleware
 * Provides custom error classes and a global error handler for consistent error responses.
 * 
 * @module middleware/error
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom Application Error class
 * Extends native Error with HTTP status code and operational flag
 */
export class AppError extends Error {
    /** HTTP status code */
    public statusCode: number;

    /** Error status string (fail/error) */
    public status: string;

    /** Flag to indicate if error is operational (expected) vs programming error */
    public isOperational: boolean;

    /**
     * Creates an AppError instance
     * @param message - Error message
     * @param statusCode - HTTP status code (default: 500)
     */
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401);
    }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super(message, 403);
    }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request') {
        super(message, 400);
    }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
    public errors: Record<string, string>[];

    constructor(message: string = 'Validation failed', errors: Record<string, string>[] = []) {
        super(message, 422);
        this.errors = errors;
    }
}

/**
 * Standard API response format
 */
interface ErrorResponse {
    success: false;
    status: string;
    message: string;
    errors?: Record<string, string>[] | undefined;
    stack?: string | undefined;
}

/**
 * Global error handler middleware
 * Catches all errors and returns consistent JSON response
 * 
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let status = 'error';
    let errors: Record<string, string>[] | undefined;

    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;

        if (err instanceof ValidationError) {
            errors = err.errors;
        }
    }

    // Log error for debugging (in development)
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Build response
    const response: ErrorResponse = {
        success: false,
        status,
        message,
    };

    // Include validation errors if present
    if (errors) {
        response.errors = errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch async errors
 * Eliminates need for try-catch in every async route handler
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function that catches errors
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle 404 - Route not found
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
};
