import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestService } from '../../services/request.service'; // Changed from MaintenanceService
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-maintenance-request',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
    templateUrl: './maintenance-request.component.html',
    styleUrl: './maintenance-request.component.css'
})
export class MaintenanceRequestComponent {
    formData = {
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'medium',
        roomNumber: '',
        buildingName: '',
        floor: '',
        contactNumber: ''
    };

    categories = [
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

    priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    isSubmitting = false;
    successMessage = '';
    errorMessage = '';
    selectedFile: File | null = null;

    /** Allowed image file types */
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    constructor(
        private requestService: RequestService, // Changed
        private authService: AuthService,
        private router: Router
    ) { }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validate file type - only allow specific image formats
            if (!this.allowedTypes.includes(file.type)) {
                this.errorMessage = 'Only image files are allowed (JPG, PNG, GIF, WebP)';
                this.selectedFile = null;
                event.target.value = ''; // Clear the file input
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'File size must be less than 5MB';
                this.selectedFile = null;
                event.target.value = ''; // Clear the file input
                return;
            }
            this.selectedFile = file;
            this.errorMessage = '';
        }
    }

    onSubmit(): void {
        if (!this.formData.title || !this.formData.description || !this.formData.roomNumber || !this.formData.buildingName) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Create FormData to send file
        const formData = new FormData();
        formData.append('category', this.formData.category);
        formData.append('title', this.formData.title);
        formData.append('description', this.formData.description);
        formData.append('priority', this.formData.priority);
        formData.append('location', `${this.formData.buildingName} - Room ${this.formData.roomNumber}`);

        // Add file if selected
        if (this.selectedFile) {
            formData.append('media', this.selectedFile);
        }

        this.requestService.createRequest(formData).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                this.successMessage = 'Request submitted successfully!';

                // Reset form
                this.formData = {
                    category: 'plumbing',
                    title: '',
                    description: '',
                    priority: 'medium',
                    roomNumber: '',
                    buildingName: '',
                    floor: '', // Keep floor and contactNumber for reset consistency
                    contactNumber: '' // Keep floor and contactNumber for reset consistency
                };
                this.selectedFile = null;

                // Redirect after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/maintenance/history']);
                }, 2000);
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = err.error?.message || 'Failed to submit request';
                console.error(err); // Log the full error for debugging
            }
        });
    }

    resetForm(): void {
        this.formData = {
            title: '',
            description: '',
            category: 'plumbing',
            priority: 'medium',
            roomNumber: '',
            buildingName: '',
            floor: '',
            contactNumber: ''
        };
        this.successMessage = '';
        this.errorMessage = '';
    }
}
