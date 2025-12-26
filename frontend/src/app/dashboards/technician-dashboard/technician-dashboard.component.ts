import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { MaintenanceRequest } from '../../models/models';

interface WorkOrderExtended {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    apartmentNumber: string;
    residentName: string;
    createdDate: Date;
    remarks?: string[];
    currentRemark?: string;
    resolutionPhotos?: string[];
}

@Component({
    selector: 'app-technician-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
    templateUrl: './technician-dashboard.component.html',
    styleUrl: './technician-dashboard.component.css'
})
export class TechnicianDashboardComponent implements OnInit {
    stats = {
        myTasks: 0,
        pending: 0,
        inProgress: 0,
        completedToday: 0
    };

    myWorkOrders: MaintenanceRequest[] = [];
    filteredWorkOrders: MaintenanceRequest[] = [];

    selectedCategory = '';
    selectedPriority = '';
    selectedStatus = '';

    completionRate = 0;
    overallProgress = 0;

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
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.requestService.getRequests().subscribe((requests: any[]) => {
            // Backend returns all requests for technician (assigned to them)
            this.myWorkOrders = requests as MaintenanceRequest[];
            this.filteredWorkOrders = [...this.myWorkOrders];
            this.calculateStats();
        });
    }

    calculateStats(): void {
        this.stats.myTasks = this.myWorkOrders.length;
        this.stats.pending = this.myWorkOrders.filter(o => o.status === 'Assigned').length;
        this.stats.inProgress = this.myWorkOrders.filter(o => o.status === 'In-Progress').length;
        // Approximation for completedToday as we don't have resolved date in default model yet
        this.stats.completedToday = this.myWorkOrders.filter(o => o.status === 'Resolved').length;

        if (this.stats.myTasks > 0) {
            this.completionRate = Math.round((this.stats.inProgress / this.stats.myTasks) * 100);
            this.overallProgress = Math.round(((this.stats.myTasks - this.stats.pending) / this.stats.myTasks) * 100);
        }
    }

    applyFilters(): void {
        this.filteredWorkOrders = this.myWorkOrders.filter(order => {
            const categoryMatch = !this.selectedCategory || order.category === this.selectedCategory;
            const priorityMatch = !this.selectedPriority || order.priority === this.selectedPriority;
            const statusMatch = !this.selectedStatus || order.status === this.selectedStatus;
            return categoryMatch && priorityMatch && statusMatch;
        });
    }

    clearFilters(): void {
        this.selectedCategory = '';
        this.selectedPriority = '';
        this.selectedStatus = '';
        this.applyFilters();
    }

    updateStatus(order: MaintenanceRequest, newStatus: string): void {
        this.requestService.updateStatus(order.id, newStatus).subscribe({
            next: () => {
                order.status = newStatus as any; // update local
                this.calculateStats();
                alert('Status updated successfully!');
            },
            error: (error) => {
                console.error('Error updating status:', error);
                alert('Failed to update status');
            }
        });
    }

    startWork(order: MaintenanceRequest): void {
        this.updateStatus(order, 'In-Progress');
    }

    markAsResolved(order: MaintenanceRequest): void {
        if (confirm('Are you sure you want to mark this task as resolved?')) {
            this.updateStatus(order, 'Resolved');
        }
    }

    getCategoryLabel(category: string): string {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : category;
    }

    formatDate(date: string | Date | undefined): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
