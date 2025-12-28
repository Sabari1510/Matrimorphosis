/**
 * @fileoverview Analytics Controller
 * Provides statistics and trends for admin dashboard
 * 
 * @module controllers/analytics
 */

import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Request as MaintenanceRequest, RequestStatus } from '../models/request.model';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

const requestRepository = AppDataSource.getRepository(MaintenanceRequest);
const userRepository = AppDataSource.getRepository(User);

/**
 * Get dashboard analytics for admin
 * 
 * @async
 * @param {AuthRequest} req - Express request with user auth
 * @param {Response} res - Express response
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        // Get counts by status
        const statusCounts = await requestRepository
            .createQueryBuilder('request')
            .select('request.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('request.is_deleted = :deleted', { deleted: false })
            .groupBy('request.status')
            .getRawMany();

        // Get counts by category
        const categoryCounts = await requestRepository
            .createQueryBuilder('request')
            .select('request.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .where('request.is_deleted = :deleted', { deleted: false })
            .groupBy('request.category')
            .getRawMany();

        // Get counts by priority
        const priorityCounts = await requestRepository
            .createQueryBuilder('request')
            .select('request.priority', 'priority')
            .addSelect('COUNT(*)', 'count')
            .where('request.is_deleted = :deleted', { deleted: false })
            .groupBy('request.priority')
            .getRawMany();

        // Get requests per day for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTrends = await requestRepository
            .createQueryBuilder('request')
            .select('DATE(request.created_at)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('request.created_at >= :startDate', { startDate: sevenDaysAgo })
            .andWhere('request.is_deleted = :deleted', { deleted: false })
            .groupBy('DATE(request.created_at)')
            .orderBy('date', 'ASC')
            .getRawMany();

        // Get total counts
        const totalRequests = await requestRepository.count({ where: { is_deleted: false } });
        const pendingRequests = await requestRepository.count({
            where: { status: RequestStatus.NEW, is_deleted: false }
        });
        const resolvedRequests = await requestRepository.count({
            where: { status: RequestStatus.RESOLVED, is_deleted: false }
        });

        // Technician stats
        const totalTechnicians = await userRepository.count({
            where: { role: UserRole.TECHNICIAN, verified: true }
        });

        // Average rating
        const avgRating = await requestRepository
            .createQueryBuilder('request')
            .select('AVG(request.feedback_rating)', 'avg')
            .where('request.feedback_rating IS NOT NULL')
            .andWhere('request.is_deleted = :deleted', { deleted: false })
            .getRawOne();

        res.json({
            overview: {
                totalRequests,
                pendingRequests,
                resolvedRequests,
                totalTechnicians,
                averageRating: avgRating?.avg ? parseFloat(avgRating.avg).toFixed(1) : '0.0'
            },
            byStatus: statusCounts,
            byCategory: categoryCounts,
            byPriority: priorityCounts,
            dailyTrends
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

/**
 * Get technician performance stats
 * 
 * @async
 * @param {AuthRequest} req - Express request with user auth
 * @param {Response} res - Express response
 */
export const getTechnicianStats = async (req: AuthRequest, res: Response) => {
    try {
        // Get technicians with their stats
        const technicianStats = await requestRepository
            .createQueryBuilder('request')
            .select('request.technician_id', 'technician_id')
            .addSelect('user.name', 'name')
            .addSelect('COUNT(*)', 'assigned_count')
            .addSelect('SUM(CASE WHEN request.status = :resolved THEN 1 ELSE 0 END)', 'resolved_count')
            .addSelect('AVG(request.feedback_rating)', 'avg_rating')
            .leftJoin('request.technician', 'user')
            .where('request.technician_id IS NOT NULL')
            .andWhere('request.is_deleted = :deleted', { deleted: false })
            .groupBy('request.technician_id')
            .addGroupBy('user.name')
            .setParameters({ resolved: RequestStatus.RESOLVED, deleted: false })
            .getRawMany();

        res.json(technicianStats.map(stat => ({
            technician_id: stat.technician_id,
            name: stat.name,
            assigned: parseInt(stat.assigned_count),
            resolved: parseInt(stat.resolved_count) || 0,
            avgRating: stat.avg_rating ? parseFloat(stat.avg_rating).toFixed(1) : 'N/A'
        })));
    } catch (error) {
        console.error('Technician stats error:', error);
        res.status(500).json({ message: 'Error fetching technician stats' });
    }
};
