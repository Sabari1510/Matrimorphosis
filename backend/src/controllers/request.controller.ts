import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Request as MaintenanceRequest, RequestStatus } from '../models/request.model';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import Media from '../models/media.schema';
import Log from '../models/log.schema';

const requestRepository = AppDataSource.getRepository(MaintenanceRequest);

// Create a new request
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

// Get requests (Role based)
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

// Update Status (Technician/Admin)
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

// Assign Technician (Admin)
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

// Resolve Request with Proof (Technician)
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

    request.status = RequestStatus.RESOLVED;
    request.completion_media = completionMediaId;
    await requestRepository.save(request);

    // Log the resolution
    Log.create({
      level: 'INFO',
      message: `Request ${id} marked as RESOLVED by Technician ${req.user.userId}`,
      meta: { notes, hasProof: !!completionMediaId }
    }).catch(err => console.log('Log failed:', err.message));


    res.json({ message: 'Task resolved successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Submit Feedback (Resident)
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

// Delete Request (Resident/Admin)
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

    // await requestRepository.remove(request); // Hard delete removed
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



