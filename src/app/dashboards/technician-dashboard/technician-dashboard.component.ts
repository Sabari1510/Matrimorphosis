import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { WorkOrderService } from '../../services/work-order.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService } from '../../services/auth.service';

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

    myWorkOrders: WorkOrderExtended[] = [];
    filteredWorkOrders: WorkOrderExtended[] = [];

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
        private workOrderService: WorkOrderService,
        private maintenanceService: MaintenanceService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        // Load work orders from maintenance requests
        this.maintenanceService.getRequests().subscribe((requests: any[]) => {
            // Filter for assigned and in-progress requests
            this.myWorkOrders = requests
                .filter((r: any) => r.status === 'assigned' || r.status === 'in-progress')
                .map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    category: r.category,
                    priority: r.priority,
                    status: r.status,
                    apartmentNumber: r.apartmentNumber,
                    residentName: r.residentName,
                    createdDate: r.createdDate,
                    remarks: r.remarks || [],
                    currentRemark: '',
                    resolutionPhotos: r.resolutionPhotos || []
                }));

            this.filteredWorkOrders = [...this.myWorkOrders];
            this.calculateStats();
        });
    }

    calculateStats(): void {
        this.stats.myTasks = this.myWorkOrders.length;
        this.stats.pending = this.myWorkOrders.filter((o: any) => o.status === 'assigned').length;
        this.stats.inProgress = this.myWorkOrders.filter((o: any) => o.status === 'in-progress').length;
        this.stats.completedToday = 0; // Would need date filtering in real app

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

    updateStatus(order: WorkOrderExtended): void {
        this.maintenanceService.updateRequest(order.id, {
            status: order.status as any
        }).subscribe({
            next: () => {
                this.calculateStats();
                alert('Status updated successfully!');
            },
            error: (error) => {
                console.error('Error updating status:', error);
                alert('Failed to update status');
            }
        });
    }

    addRemark(order: WorkOrderExtended): void {
        if (order.currentRemark && order.currentRemark.trim()) {
            if (!order.remarks) {
                order.remarks = [];
            }
            order.remarks.push(order.currentRemark.trim());

            this.maintenanceService.updateRequest(order.id, {
                remarks: order.remarks
            }).subscribe({
                next: () => {
                    order.currentRemark = '';
                    alert('Remark added successfully!');
                },
                error: (error) => {
                    console.error('Error adding remark:', error);
                    alert('Failed to add remark');
                }
            });
        }
    }

    onResolutionPhotoSelected(event: Event, order: WorkOrderExtended): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            Array.from(input.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!order.resolutionPhotos) {
                        order.resolutionPhotos = [];
                    }
                    order.resolutionPhotos.push(e.target?.result as string);

                    this.maintenanceService.updateRequest(order.id, {
                        resolutionPhotos: order.resolutionPhotos
                    }).subscribe();
                };
                reader.readAsDataURL(file);
            });
        }
    }

    startWork(order: WorkOrderExtended): void {
        order.status = 'in-progress';
        this.updateStatus(order);
    }

    markAsResolved(order: WorkOrderExtended): void {
        if (confirm('Are you sure you want to mark this task as resolved?')) {
            order.status = 'completed';
            this.maintenanceService.updateRequest(order.id, {
                status: 'completed' as any,
                completedDate: new Date()
            }).subscribe({
                next: () => {
                    // Remove from current list
                    this.myWorkOrders = this.myWorkOrders.filter(o => o.id !== order.id);
                    this.applyFilters();
                    this.calculateStats();
                    alert('Task marked as resolved!');
                },
                error: (error) => {
                    console.error('Error marking as resolved:', error);
                    alert('Failed to mark as resolved');
                }
            });
        }
    }

    getCategoryLabel(category: string): string {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : category;
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
