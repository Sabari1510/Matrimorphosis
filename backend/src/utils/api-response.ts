/**
 * @fileoverview Standardized API Response Utilities
 * Provides consistent response format across all API endpoints.
 * 
 * @module utils/api-response
 */

import { Response } from 'express';

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T | undefined;
    meta?: {
        total?: number | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        totalPages?: number | undefined;
    } | undefined;
}

/**
 * Send a success response
 * 
 * @param res - Express response object
 * @param message - Success message
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 * 
 * @example
 * sendSuccess(res, 'User created successfully', { id: 1, name: 'John' }, 201);
 */
export const sendSuccess = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };

    return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response
 * 
 * @param res - Express response object
 * @param message - Success message
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * 
 * @example
 * sendPaginated(res, 'Requests fetched', requests, { total: 100, page: 1, limit: 10 });
 */
export const sendPaginated = <T>(
    res: Response,
    message: string,
    data: T[],
    pagination: { total: number; page: number; limit: number }
): Response => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: ApiResponse<T[]> = {
        success: true,
        message,
        data,
        meta: {
            total: pagination.total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages,
        },
    };

    return res.status(200).json(response);
};

/**
 * Send an error response
 * 
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * 
 * @example
 * sendError(res, 'User not found', 404);
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500
): Response => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

/**
 * HTTP status codes with descriptions
 */
export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;
