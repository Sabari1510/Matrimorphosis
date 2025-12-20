export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'resident';
  firstName: string;
  lastName: string;
  apartmentNumber?: string;
  phoneNumber?: string;
}

export type ComplaintCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'security' | 'cleaning' | 'painting' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  residentId: string;
  residentName: string;
  apartmentNumber: string;
  createdDate: Date;
  updatedDate: Date;
  completedDate?: Date;
  images?: string[];
  photos?: string[];
  assignedTo?: string;
  workOrderId?: string;
  remarks?: string[];
  resolutionPhotos?: string[];
  resolvedBy?: string;
  resolvedDate?: Date;
}

export interface WorkOrder {
  id: string;
  requestId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in-progress' | 'completed' | 'on-hold';
  assignedTo: string;
  assignedStaffName: string;
  createdDate: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  notes: WorkOrderNote[];
  materials?: Material[];
}

export interface WorkOrderNote {
  id: string;
  workOrderId: string;
  userId: string;
  userName: string;
  note: string;
  createdDate: Date;
  images?: string[];
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface PreventiveMaintenance {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastPerformed?: Date;
  nextScheduled: Date;
  assignedTo?: string;
  status: 'scheduled' | 'overdue' | 'completed';
  location: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdDate: Date;
  link?: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  averageCompletionTime: number;
  upcomingPreventiveMaintenance: number;
  overduePreventiveMaintenance: number;
}

export interface Report {
  id: string;
  title: string;
  type: 'maintenance' | 'work-order' | 'preventive' | 'cost';
  generatedDate: Date;
  generatedBy: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
}
