import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService } from '../../services/auth.service';
import { MaintenanceRequest, ComplaintCategory, ComplaintPriority } from '../../models/models';

interface CategoryOption {
    value: ComplaintCategory;
    label: string;
    icon: string;
}

interface PriorityOption {
    value: ComplaintPriority;
    label: string;
}

interface PhotoFile {
    file: File;
    preview: string;
}

@Component({
    selector: 'app-resident-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarComponent, ReactiveFormsModule],
    templateUrl: './resident-dashboard.component.html',
    styleUrl: './resident-dashboard.component.css'
})
export class ResidentDashboardComponent implements OnInit {
    complaintForm: FormGroup;
    requests: MaintenanceRequest[] = [];
    selectedPhotos: PhotoFile[] = [];
    isSubmitting = false;
    unreadNotifications = 3;

    stats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    };

    categories: CategoryOption[] = [
        { value: 'plumbing', label: 'Plumbing', icon: 'P' },
        { value: 'electrical', label: 'Electrical', icon: 'E' },
        { value: 'hvac', label: 'HVAC', icon: 'H' },
        { value: 'appliance', label: 'Appliance', icon: 'A' },
        { value: 'security', label: 'Security', icon: 'S' },
        { value: 'cleaning', label: 'Cleaning', icon: 'C' },
        { value: 'painting', label: 'Painting', icon: 'PT' },
        { value: 'structural', label: 'Structural', icon: 'ST' },
        { value: 'other', label: 'Other', icon: 'O' }
    ];

    priorities: PriorityOption[] = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    constructor(
        private fb: FormBuilder,
        private maintenanceService: MaintenanceService,
        private authService: AuthService
    ) {
        this.complaintForm = this.fb.group({
            category: ['', Validators.required],
            title: ['', Validators.required],
            description: ['', Validators.required],
            priority: ['medium', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
            this.maintenanceService.getRequestsByResident(currentUser.id).subscribe(requests => {
                this.requests = requests.sort((a, b) =>
                    new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
                );
                this.calculateStats();
            });
        }
    }

    calculateStats(): void {
        this.stats.total = this.requests.length;
        this.stats.pending = this.requests.filter(r => r.status === 'pending').length;
        this.stats.inProgress = this.requests.filter(r => r.status === 'in-progress' || r.status === 'assigned').length;
        this.stats.completed = this.requests.filter(r => r.status === 'completed').length;
    }

    selectCategory(category: ComplaintCategory): void {
        this.complaintForm.patchValue({ category });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            Array.from(input.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedPhotos.push({
                        file,
                        preview: e.target?.result as string
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    }

    removePhoto(index: number): void {
        this.selectedPhotos.splice(index, 1);
    }

    onSubmitComplaint(): void {
        if (this.complaintForm.valid) {
            this.isSubmitting = true;
            const currentUser = this.authService.currentUserValue;

            if (currentUser) {
                const newRequest = {
                    title: this.complaintForm.value.title,
                    description: this.complaintForm.value.description,
                    category: this.complaintForm.value.category,
                    priority: this.complaintForm.value.priority,
                    status: 'pending' as const,
                    residentId: currentUser.id,
                    residentName: `${currentUser.firstName} ${currentUser.lastName}`,
                    apartmentNumber: currentUser.apartmentNumber || 'N/A',
                    photos: this.selectedPhotos.map(p => p.preview)
                };

                this.maintenanceService.createRequest(newRequest).subscribe({
                    next: (request) => {
                        this.requests.unshift(request);
                        this.calculateStats();
                        this.complaintForm.reset({ priority: 'medium' });
                        this.selectedPhotos = [];
                        this.isSubmitting = false;
                        alert('Complaint submitted successfully!');
                    },
                    error: (error) => {
                        console.error('Error submitting complaint:', error);
                        this.isSubmitting = false;
                        alert('Failed to submit complaint. Please try again.');
                    }
                });
            }
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

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
