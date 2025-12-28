/**
 * @fileoverview Application Constants and Enums
 * Centralized location for all constants used across the application.
 * 
 * @module utils/constants
 */

/**
 * Request status enum values
 */
export const REQUEST_STATUS = {
    NEW: 'Submitted',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In-Progress',
    RESOLVED: 'Completed',
} as const;

/**
 * Request priority levels
 */
export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
} as const;

/**
 * User role values
 */
export const USER_ROLES = {
    ADMIN: 'Admin',
    TECHNICIAN: 'Technician',
    RESIDENT: 'Resident',
} as const;

/**
 * Request categories
 */
export const REQUEST_CATEGORIES = {
    PLUMBING: 'plumbing',
    ELECTRICAL: 'electrical',
    HVAC: 'hvac',
    APPLIANCE: 'appliance',
    STRUCTURAL: 'structural',
    PEST_CONTROL: 'pest_control',
    CLEANING: 'cleaning',
    OTHER: 'other',
} as const;

/**
 * Technician specializations (matches categories)
 */
export const SPECIALIZATIONS = Object.values(REQUEST_CATEGORIES);

/**
 * Password validation regex
 * - Minimum 6 characters
 * - At least 1 letter
 * - At least 1 number
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (basic)
 */
export const PHONE_REGEX = /^[\d\s\-+()]{10,15}$/;

/**
 * JWT configuration
 */
export const JWT_CONFIG = {
    EXPIRES_IN: '24h',
    ALGORITHM: 'HS256' as const,
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};

/**
 * File upload limits
 */
export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ],
};

/**
 * API rate limiting
 */
export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // per window
    AUTH_MAX_REQUESTS: 10, // stricter for auth endpoints
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    // Auth
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    ACCOUNT_NOT_VERIFIED: 'Account pending admin verification',
    TOKEN_EXPIRED: 'Session expired. Please login again',
    TOKEN_INVALID: 'Invalid authentication token',

    // Authorization
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'Access forbidden',

    // Validation
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    WEAK_PASSWORD: 'Password must be at least 6 characters with 1 letter and 1 number',

    // Resource
    NOT_FOUND: 'Resource not found',
    REQUEST_NOT_FOUND: 'Maintenance request not found',
    USER_NOT_FOUND: 'User not found',

    // Server
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    // Auth
    REGISTERED: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',

    // Request
    REQUEST_CREATED: 'Maintenance request created successfully',
    REQUEST_UPDATED: 'Request updated successfully',
    REQUEST_DELETED: 'Request deleted successfully',
    TECHNICIAN_ASSIGNED: 'Technician assigned successfully',
    REQUEST_RESOLVED: 'Request marked as resolved',
    FEEDBACK_SUBMITTED: 'Feedback submitted successfully',

    // User
    USER_VERIFIED: 'User verified successfully',
    USER_DELETED: 'User deleted successfully',
} as const;
