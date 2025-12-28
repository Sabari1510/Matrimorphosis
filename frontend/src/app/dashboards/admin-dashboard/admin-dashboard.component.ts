import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestModalComponent } from '../../shared/request-modal/request-modal.component';
import { RequestService } from '../../services/request.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { MaintenanceRequest } from '../../models/models';

Chart.register(...registerables);

interface StaffPerformance {
    id: string;
    name: string;
    initials: string;
    role: string;
    assigned: number;
    completed: number;
    avgTime: number;
    specialization?: string;
    avgRating?: number;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarComponent, FormsModule, RequestModalComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

    stats = {
        totalRequests: 0,
        pendingRequests: 0,
        resolvedRequests: 0,
        overdueRequests: 0,
        activeWorkOrders: 0,
        completedToday: 0,
        totalStaff: 5,
        totalResidents: 45
    };

    recentRequests: MaintenanceRequest[] = [];
    allRequests: MaintenanceRequest[] = [];

    staffPerformance: StaffPerformance[] = []; // Loaded from database
    pendingTechnicians: any[] = []; // Technicians awaiting approval
    availableTechnicians: any[] = []; // Filtered technicians for assignment

    showAssignModal = false;
    selectedRequest: MaintenanceRequest | null = null;
    selectedComplaint: MaintenanceRequest | null = null;
    selectedDetailRequest: any = null;
    selectedStaffId = '';
    userName: string = '';
    userId: number = 0;

    categories = [
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'hvac', label: 'HVAC' },
        { value: 'appliance', label: 'Appliance' },
        { value: 'security', label: 'Security' },
        { value: 'cleaning', label: 'Cleaning' },
        { value: 'painting', label: 'Painting' },
        { value: 'structural', label: 'Structural' },
        { value: 'other', label: 'Other' }
    ];

    constructor(
        private requestService: RequestService,
        private userService: UserService,
        private adminService: AdminService
    ) { }

    ngOnInit(): void {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userName = payload.name || 'Admin';
            this.userId = payload.userId || 0;
        }
        this.loadData();
    }

    loadData(): void {
        this.requestService.getRequests().subscribe((requests: any[]) => {
            this.allRequests = requests as MaintenanceRequest[];
            this.recentRequests = this.allRequests.slice(0, 10);
            this.calculateStats();
        });

        // Load real technicians from database
        this.userService.getTechnicians().subscribe({
            next: (technicians) => {
                this.staffPerformance = technicians.map(tech => {
                    const assignedRequests = this.allRequests.filter(r => r.technician_id === tech.id);
                    const completedRequests = assignedRequests.filter(r => r.status === 'Resolved');

                    const ratings = completedRequests
                        .filter(r => r.feedback_rating !== null && r.feedback_rating !== undefined && r.feedback_rating > 0)
                        .map(r => r.feedback_rating as number);
                    const avgRating = ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length) : 0;

                    return {
                        id: tech.id.toString(),
                        name: tech.name,
                        initials: this.getInitials(tech.name),
                        role: 'Technician',
                        specialization: tech.specialization,
                        assigned: assignedRequests.length,
                        completed: completedRequests.length,
                        avgRating: avgRating,
                        avgTime: 0
                    };
                });
            },
            error: (err) => console.error('Error loading technicians:', err)
        });

        // Load pending technicians for approval
        this.adminService.getPendingTechnicians().subscribe({
            next: (pending) => {
                this.pendingTechnicians = pending;
            },
            error: (err) => console.error('Error loading pending technicians:', err)
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    calculateStats(): void {
        this.stats.totalRequests = this.allRequests.length;
        this.stats.pendingRequests = this.allRequests.filter(r => r.status === 'New').length;
        this.stats.resolvedRequests = this.allRequests.filter(r => r.status === 'Resolved').length;

        // Calculate overdue (pending for more than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        this.stats.overdueRequests = this.allRequests.filter(r =>
            r.status === 'New' && new Date(r.created_at) < sevenDaysAgo
        ).length;
    }

    assignComplaint(): void {
        if (this.selectedComplaint && this.selectedStaffId) {
            // const staff = this.staffPerformance.find(s => s.id === this.selectedStaffId); 
            // Mock staff logic for now as we don't have real staff performance data linked yet

            this.requestService.assignTechnician(this.selectedComplaint.id, parseInt(this.selectedStaffId)).subscribe({
                next: () => {
                    this.loadData();
                    this.closeAssignModal();
                    alert(`Complaint assigned successfully!`);
                },
                error: (error) => {
                    console.error('Error assigning complaint:', error);
                    alert('Failed to assign complaint');
                }
            });
        }
    }

    getCategoryLabel(category: string): string {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : category;
    }

    formatStatus(status: string): string {
        return status.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatDate(date: Date | string | undefined): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    approveTechnician(id: number): void {
        if (confirm('Approve this technician?')) {
            this.adminService.approveTechnician(id).subscribe({
                next: () => {
                    this.pendingTechnicians = this.pendingTechnicians.filter(t => t.id !== id);
                    alert('Technician approved successfully!');
                    this.loadData(); // Reload to update staff list
                },
                error: (err) => {
                    console.error('Error approving technician:', err);
                    alert('Failed to approve technician');
                }
            });
        }
    }

    handleDeleteStaff(id: string): void {
        if (confirm('Are you sure you want to delete this staff member? This will remove their account and all associated data.')) {
            this.adminService.deleteStaff(parseInt(id)).subscribe({
                next: () => {
                    alert('Staff member deleted successfully');
                    this.loadData();
                },
                error: (err) => {
                    console.error('Error deleting staff:', err);
                    alert(err.error?.message || 'Failed to delete staff member');
                }
            });
        }
    }

    rejectTechnician(id: number): void {
        if (confirm('Reject and delete this technician account?')) {
            this.adminService.rejectTechnician(id).subscribe({
                next: () => {
                    this.pendingTechnicians = this.pendingTechnicians.filter(t => t.id !== id);
                    alert('Technician rejected');
                },
                error: (err) => {
                    console.error('Error rejecting technician:', err);
                    alert('Failed to reject technician');
                }
            });
        }
    }

    openAssignModal(request: MaintenanceRequest): void {
        if (!request || request.status === 'Resolved') return;
        this.selectedRequest = request;
        this.showAssignModal = true;

        // Fetch technicians filtered by the request category (case-insensitive)
        const category = request.category ? request.category.toLowerCase() : '';
        this.userService.getTechniciansBySpecialization(category).subscribe({
            next: (technicians) => {
                this.availableTechnicians = technicians;

                // If no specialized technicians found, fallback to showing all verified technicians
                if (this.availableTechnicians.length === 0) {
                    this.loadAllTechnicians();
                }
            },
            error: (err) => {
                console.error('Error loading technicians:', err);
                this.loadAllTechnicians();
            }
        });
    }

    private loadAllTechnicians(): void {
        this.userService.getTechnicians().subscribe({
            next: (technicians: any[]) => {
                // Only show verified technicians
                this.availableTechnicians = technicians.filter((t: any) => t.verified !== false);
            },
            error: (err: any) => console.error('Error loading all technicians:', err)
        });
    }

    assignTechnician(technicianId: number): void {
        if (!this.selectedRequest) return;

        this.requestService.assignTechnician(this.selectedRequest.id, technicianId).subscribe({
            next: () => {
                alert('Technician assigned successfully');
                this.showAssignModal = false;
                this.selectedRequest = null;
                this.loadData(); // Reload data to reflect changes
            },
            error: (err) => {
                console.error('Error assigning technician:', err);
                alert('Failed to assign technician');
            }
        });
    }

    deleteRequest(event: Event, id: number): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this maintenance request?')) {
            this.requestService.deleteRequest(id).subscribe({
                next: () => {
                    this.loadData();
                    alert('Request deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting request:', err);
                    alert('Failed to delete request');
                }
            });
        }
    }

    scrollTo(elementId: string): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    closeAssignModal(): void {
        this.showAssignModal = false;
        this.selectedRequest = null;
        this.availableTechnicians = [];
    }

    viewRequestDetails(request: any): void {
        this.selectedDetailRequest = request;
    }

    closeDetailModal(): void {
        this.selectedDetailRequest = null;
    }

    getMediaUrl(path: string | null): string {
        if (!path) return '';
        if (path.startsWith('/uploads/')) {
            return `http://localhost:3000${path}`;
        }
        return `http://localhost:3000/api/media/${path}`;
    }
}
