/**
 * @fileoverview Maintenance Request Controller
 * Handles CRUD operations for maintenance requests including creation,
 * retrieval, status updates, technician assignment, and feedback.
 * 
 * @module controllers/request
 * @requires express
 * @requires typeorm
 */

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Request as MaintenanceRequest, RequestStatus } from '../models/request.model';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import Media from '../models/media.schema';
import Log from '../models/log.schema';

/** Repository instance for maintenance request operations */
const requestRepository = AppDataSource.getRepository(MaintenanceRequest);

/**
 * Creates a new maintenance request
 * 
 * @async
 * @function createRequest
 * @param {AuthRequest} req - Authenticated request object
 * @param {string} req.body.category - Request category (plumbing, electrical, etc.)
 * @param {string} req.body.title - Request title/summary
 * @param {string} req.body.description - Detailed description of the issue
 * @param {string} req.body.priority - Priority level (low, medium, high, urgent)
 * @param {string} [req.body.location] - Location of the issue
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Created request object
 * 
 * @throws {500} If error occurs during creation
 */
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { category, title, description, priority, location } = req.body;
    const residentId = req.user.userId;

    // Save uploaded file to MongoDB if exists
    let mediaId = null;
    if ((req as any).file) {
      const media = new Media({
        filename: (req as any).file.originalname,
        contentType: (req as any).file.mimetype,
        data: (req as any).file.buffer
      });
      const savedMedia = await media.save();
      mediaId = savedMedia._id.toString();
    }

    const newRequest = new MaintenanceRequest();

    newRequest.resident_id = residentId;
    newRequest.category = category;
    newRequest.title = title;
    newRequest.description = description;
    newRequest.priority = priority;
    newRequest.location = location;
    newRequest.media = mediaId;
    newRequest.status = RequestStatus.NEW;


    await requestRepository.save(newRequest);

    // Log (non-blocking)
    Log.create({
      level: 'INFO',
      message: `New Request Created: ID ${newRequest.id}`,
      meta: { userId: residentId, category, hasImage: !!mediaId },
    }).catch(err => console.log('MongoDB logging failed:', err.message));


    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating request' });
  }
};

/**
 * Retrieves maintenance requests based on user role
 * - Residents: See their own requests (including admin-deleted for status visibility)
 * - Technicians: See requests assigned to them
 * - Admins: See all non-deleted requests
 * 
 * @async
 * @function getRequests
 * @param {AuthRequest} req - Authenticated request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Array of maintenance requests
 * 
 * @throws {403} If user role is unauthorized
 * @throws {500} If error occurs during retrieval
 */
export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user;
    let requests;

    if (role === UserRole.RESIDENT) {
      // Residents see non-deleted OR those deleted by admin (to show status)
      requests = await requestRepository.find({
        where: [
          { resident_id: userId, is_deleted: false },
          { resident_id: userId, is_deleted: true, deleted_by_role: UserRole.ADMIN }
        ],
        relations: ['technician'],
        order: { created_at: 'DESC' }
      });
    } else if (role === UserRole.TECHNICIAN) {
      requests = await requestRepository.find({
        where: { technician_id: userId, is_deleted: false },
        relations: ['resident'],
        order: { created_at: 'DESC' }
      });
    } else if (role === UserRole.ADMIN) {
      // Admin sees all non-deleted
      requests = await requestRepository.find({
        where: { is_deleted: false },
        relations: ['resident', 'technician'],
        order: { created_at: 'DESC' }
      });

    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

/**
 * Updates the status of a maintenance request
 * 
 * @async
 * @function updateStatus
 * @param {AuthRequest} req - Authenticated request object
 * @param {string} req.params.id - Request ID
 * @param {string} req.body.status - New status value
 * @param {string} [req.body.notes] - Optional notes about the update
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Updated request object
 * 
 * @throws {400} If request ID is missing
 * @throws {404} If request not found
 * @throws {500} If error occurs during update
 */
export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    const request = await requestRepository.findOne({ where: { id: parseInt(id) } });

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await requestRepository.save(request);

    // Log the status change and notes
    await Log.create({
      level: 'INFO',
      message: `Request ${id} status updated to ${status}`,
      meta: { userId: req.user.userId, notes, oldStatus: request.status }
    });

    res.json({ message: 'Status updated', request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
};

/**
 * Assigns a technician to a maintenance request (Admin only)
 * 
 * @async
 * @function assignTechnician
 * @param {AuthRequest} req - Authenticated request object (must be Admin)
 * @param {string} req.params.id - Request ID
 * @param {number} req.body.technicianId - Technician user ID to assign
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Updated request with assigned technician
 * 
 * @throws {400} If request ID is missing
 * @throws {404} If request not found
 * @throws {500} If error occurs during assignment
 */
export const assignTechnician = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    const request = await requestRepository.findOne({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.technician_id = technicianId;
    request.status = RequestStatus.ASSIGNED;
    request.assigned_at = new Date(); // Track when assigned for delay calculation
    await requestRepository.save(request);

    await Log.create({
      level: 'INFO',
      message: `Request ${id} assigned to Technician ${technicianId}`,
      meta: { adminId: req.user.userId }
    });

    res.json({ message: 'Technician assigned', request });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning technician' });
  }
}

/**
 * Marks a request as resolved with optional completion proof
 * 
 * @async
 * @function resolveRequest
 * @param {AuthRequest} req - Authenticated request (Technician or Admin)
 * @param {string} req.params.id - Request ID
 * @param {string} [req.body.notes] - Resolution notes
 * @param {File} [req.file] - Completion proof image
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Resolved request object
 * 
 * @throws {400} If request ID is missing
 * @throws {403} If user is not assigned technician or admin
 * @throws {404} If request not found
 * @throws {500} If error occurs
 */
export const resolveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!id) return res.status(400).json({ message: 'Request ID is required' });

    const request = await requestRepository.findOne({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Ensure only the assigned technician or admin can resolve
    if (req.user.role !== UserRole.ADMIN && request.technician_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You are not assigned to this task' });
    }

    // Save uploaded completion photo to MongoDB if exists
    let completionMediaId = null;
    if ((req as any).file) {
      const media = new Media({
        filename: (req as any).file.originalname,
        contentType: (req as any).file.mimetype,
        data: (req as any).file.buffer
      });
      const savedMedia = await media.save();
      completionMediaId = savedMedia._id.toString();
    }

    // Calculate delay penalty (if resolved late)
    let delayPenalty = 0;
    let delayDays = 0;
    if (request.assigned_at) {
      const assignedDate = new Date(request.assigned_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60);
      delayDays = Math.floor(hoursDiff / 24);

      if (hoursDiff > 72) {
        delayPenalty = 2; // Major delay: -2 from rating
      } else if (hoursDiff > 48) {
        delayPenalty = 1; // Moderate delay: -1 from rating
      }
    }

    request.status = RequestStatus.RESOLVED;
    request.completion_media = completionMediaId;
    await requestRepository.save(request);

    // Log the resolution with delay info
    Log.create({
      level: 'INFO',
      message: `Request ${id} marked as RESOLVED by Technician ${req.user.userId}`,
      meta: { notes, hasProof: !!completionMediaId, delayDays, delayPenalty }
    }).catch(err => console.log('Log failed:', err.message));


    res.json({
      message: 'Task resolved successfully',
      request,
      delayPenalty,
      delayDays,
      note: delayPenalty > 0 ? `Late resolution: -${delayPenalty} rating penalty applied` : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Submits feedback for a resolved request (Resident only)
 * 
 * @async
 * @function submitFeedback
 * @param {AuthRequest} req - Authenticated request (must be request owner)
 * @param {string} req.params.id - Request ID
 * @param {number} req.body.feedback_rating - Rating (1-5)
 * @param {string} [req.body.feedback_comments] - Optional comments
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Updated request with feedback
 * 
 * @throws {400} If request ID or rating is missing
 * @throws {403} If user is not the request owner
 * @throws {404} If request not found
 * @throws {500} If error occurs
 */
export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback_rating, feedback_comments } = req.body;

    if (!id) return res.status(400).json({ message: 'Request ID is required' });
    if (!feedback_rating) return res.status(400).json({ message: 'Rating is mandatory' });

    const request = await requestRepository.findOne({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Ensure only the resident who raised it can provide feedback
    if (request.resident_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.feedback_rating = feedback_rating;
    request.feedback_comments = feedback_comments;
    await requestRepository.save(request);

    // Log feedback
    Log.create({
      level: 'INFO',
      message: `Feedback received for Request ${id}: Rating ${feedback_rating}`,
      meta: { residentId: req.user.userId, technicianId: request.technician_id }
    }).catch(err => console.log('Log failed:', err.message));

    res.json({ message: 'Feedback submitted successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Soft-deletes a maintenance request
 * 
 * @async
 * @function deleteRequest
 * @param {AuthRequest} req - Authenticated request (Resident owner or Admin)
 * @param {string} req.params.id - Request ID
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Success message
 * 
 * @throws {400} If request ID missing or trying to delete resolved request
 * @throws {403} If user doesn't own the request and is not admin
 * @throws {404} If request not found
 * @throws {500} If error occurs
 */
export const deleteRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Request ID is required' });

    const request = await requestRepository.findOne({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Ensure only the resident who raised it or an Admin can delete
    if (req.user.role !== UserRole.ADMIN && request.resident_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own requests' });
    }

    // Optional: Only allow deleting if it's NEW or ASSIGNED (not resolved)
    if (request.status === RequestStatus.RESOLVED && req.user.role !== UserRole.ADMIN) {
      return res.status(400).json({ message: 'Cannot delete a resolved request' });
    }

    // Soft delete
    request.is_deleted = true;
    request.deleted_by_role = req.user.role;
    await requestRepository.save(request);

    // Log deletion
    Log.create({
      level: 'WARN',
      message: `Request ${id} soft-deleted by User ${req.user.userId}`,
      meta: { role: req.user.role }
    }).catch(err => console.log('Log failed:', err.message));

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
