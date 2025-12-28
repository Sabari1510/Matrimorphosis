/**
 * @fileoverview Comment Controller
 * Handles adding and retrieving comments for maintenance requests
 * 
 * @module controllers/comment
 */

import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Comment } from '../models/comment.model';
import { Request as MaintenanceRequest } from '../models/request.model';
import { AuthRequest } from '../middleware/auth.middleware';

const commentRepository = AppDataSource.getRepository(Comment);
const requestRepository = AppDataSource.getRepository(MaintenanceRequest);

/**
 * Add a comment to a maintenance request
 * 
 * @async
 * @param {AuthRequest} req - Express request with user auth
 * @param {Response} res - Express response
 */
export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const requestId = parseInt(req.params.id!, 10);
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Comment message is required' });
        }

        // Check if request exists
        const request = await requestRepository.findOne({
            where: { id: requestId, is_deleted: false }
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify user has access to this request
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        const hasAccess =
            userRole === 'Admin' ||
            request.resident_id === userId ||
            request.technician_id === userId;

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied to this request' });
        }

        // Create comment
        const comment = commentRepository.create({
            request_id: requestId,
            user_id: userId!,
            message: message.trim()
        });

        await commentRepository.save(comment);

        res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                id: comment.id,
                message: comment.message,
                created_at: comment.created_at
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

/**
 * Get all comments for a maintenance request
 * 
 * @async
 * @param {AuthRequest} req - Express request with user auth
 * @param {Response} res - Express response
 */
export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const requestId = parseInt(req.params.id!, 10);

        // Check if request exists
        const request = await requestRepository.findOne({
            where: { id: requestId, is_deleted: false }
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify user has access
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        const hasAccess =
            userRole === 'Admin' ||
            request.resident_id === userId ||
            request.technician_id === userId;

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied to this request' });
        }

        // Get comments with user info
        const comments = await commentRepository.find({
            where: { request_id: requestId },
            relations: ['user'],
            order: { created_at: 'ASC' },
            select: {
                id: true,
                message: true,
                created_at: true,
                user: {
                    id: true,
                    name: true,
                    role: true
                }
            }
        });

        res.json(comments);
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};
