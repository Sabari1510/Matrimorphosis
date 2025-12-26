import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestModalComponent } from '../../shared/request-modal/request-modal.component';
import { RequestService } from '../../services/request.service';
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
    imports: [CommonModule, RouterModule, NavbarComponent, ReactiveFormsModule, RequestModalComponent],
    templateUrl: './resident-dashboard.component.html',
    styleUrl: './resident-dashboard.component.css'
})
export class ResidentDashboardComponent implements OnInit {
    complaintForm: FormGroup;
    requests: MaintenanceRequest[] = [];
    selectedPhotos: PhotoFile[] = [];
    isSubmitting = false;
    unreadNotifications = 3;
    userName: string = '';
    userId: number = 0;
    selectedRequest: any = null;

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
        private requestService: RequestService, // Changed from MaintenanceService
        private authService: AuthService,
        private router: Router
    ) {
        this.complaintForm = this.fb.group({
            category: ['', Validators.required],
            title: ['', Validators.required],
            description: ['', Validators.required],
            priority: ['medium', Validators.required]
        });
    }

    ngOnInit(): void {
        // Get user name from localStorage token
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userName = payload.name || 'User';
            this.userId = payload.userId || 0;
        }

        this.loadRequests();
    }

    loadRequests(): void {
        // RequestService.getRequests() automatically uses the logged-in user's ID/Role from the token
        this.requestService.getRequests().subscribe((requests: any[]) => {
            this.requests = requests.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            this.calculateStats();
        });
    }

    calculateStats(): void {
        this.stats.total = this.requests.length;
        this.stats.pending = this.requests.filter(r => r.status === 'New').length;
        this.stats.inProgress = this.requests.filter(r => r.status === 'In-Progress' || r.status === 'Assigned').length;
        this.stats.completed = this.requests.filter(r => r.status === 'Resolved').length;
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
        // This method seems redundant as "onSubmit" is mainly handled in the maintenance-request.component
        // But the dashboard has a "Quick Actions" that redirects.
        // Wait, the dashboard *template* doesn't seem to have a form?
        // Ah, looking at the template, it only has links to "New Request".
        // The form logic here might be dead code or for a modal?
        // I will just comment out the submit logic here or leave it but update service call if it was used.
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

    viewRequestDetails(request: any): void {
        this.selectedRequest = request;
    }

    closeRequestModal(): void {
        this.selectedRequest = null;
    }

    // Quick action navigation methods
    openNewRequestModal(): void {
        // Navigate to new request page using Angular Router
        this.router.navigate(['/maintenance/new']);
    }

    trackRequests(): void {
        // Scroll to requests section
        const requestsSection = document.querySelector('.requests-section');
        if (requestsSection) {
            requestsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    viewHistory(): void {
        // Navigate to history page using Angular Router
        this.router.navigate(['/maintenance/history']);
    }

    contactSupport(): void {
        // Scroll to contact card
        const contactCard = document.querySelector('.contact-card');
        if (contactCard) {
            contactCard.scrollIntoView({ behavior: 'smooth' });
        }
    }
}
