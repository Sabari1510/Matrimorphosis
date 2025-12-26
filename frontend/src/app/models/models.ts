export type RequestStatus = 'New' | 'Assigned' | 'In-Progress' | 'Resolved';
export type RequestCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'security' | 'cleaning' | 'painting' | 'structural' | 'other';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceRequest {
  id: number;
  resident_id: number;
  technician_id?: number;
  category: RequestCategory;
  title: string;
  description: string;
  priority: RequestPriority;
  location: string;
  media?: string;
  status: RequestStatus;
  feedback_rating?: number;
  feedback_comments?: string;
  created_at: string;

  // Extended fields for UI (from joined data or frontend-only)
  resident?: any;
  technician?: any;
  apartmentNumber?: string;
  residentName?: string;
  technicianName?: string;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  remarks?: string[];
  currentRemark?: string;
  resolutionPhotos?: string[];
  photos?: string[];
  createdDate?: Date; // Legacy field for compatibility
  is_deleted?: boolean;
  deleted_by_role?: string;
}

export type ComplaintCategory = RequestCategory;
export type ComplaintPriority = RequestPriority;

export interface User {
  id: number;
  name: string;
  role: string;
  contact_info: string;
  employee_id?: string;
  specialization?: string;
  phone?: string;
  photo?: string;
  verified?: boolean;
}
