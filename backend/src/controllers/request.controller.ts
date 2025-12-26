import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Request as MaintenanceRequest, RequestStatus } from '../models/request.model';
import { UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import Log from '../models/log.schema';

const requestRepository = AppDataSource.getRepository(MaintenanceRequest);

// Create a new request
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { category, title, description, priority, location } = req.body;
    const residentId = req.user.userId;

    // Get uploaded file path if exists
    const mediaPath = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;

    const newRequest = new MaintenanceRequest();
    newRequest.resident_id = residentId;
    newRequest.category = category;
    newRequest.title = title;
    newRequest.description = description;
    newRequest.priority = priority;
    newRequest.location = location;
    newRequest.media = mediaPath || null;
    newRequest.status = RequestStatus.NEW;

    await requestRepository.save(newRequest);

    // Log (non-blocking)
    Log.create({
      level: 'INFO',
      message: `New Request Created: ID ${newRequest.id}`,
      meta: { userId: residentId, category, hasImage: !!mediaPath },
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
      requests = await requestRepository.find({
        where: { resident_id: userId },
        relations: ['technician'],
        order: { created_at: 'DESC' }
      });
    } else if (role === UserRole.TECHNICIAN) {
      requests = await requestRepository.find({
        where: { technician_id: userId },
        relations: ['resident'],
        order: { created_at: 'DESC' }
      });
    } else if (role === UserRole.ADMIN) {
      // Admin sees all
      requests = await requestRepository.find({
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
