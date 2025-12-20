import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MaintenanceService } from '../../services/maintenance.service';
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

    constructor(
        private maintenanceService: MaintenanceService,
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.formData.title || !this.formData.description || !this.formData.roomNumber || !this.formData.buildingName) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        const currentUser = this.authService.currentUserValue;
        if (!currentUser) {
            this.errorMessage = 'User not authenticated';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const requestData = {
            ...this.formData,
            residentId: currentUser.id,
            residentName: `${currentUser.firstName} ${currentUser.lastName}`,
            apartmentNumber: this.formData.roomNumber,
            status: 'pending' as const,
            priority: this.formData.priority as 'low' | 'medium' | 'high' | 'urgent',
            category: this.formData.category as 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other'
        };

        this.maintenanceService.createRequest(requestData).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.successMessage = 'Request submitted successfully!';
                setTimeout(() => {
                    this.router.navigate(['/maintenance/requests']);
                }, 1500);
            },
            error: (error) => {
                this.isSubmitting = false;
                this.errorMessage = 'Failed to submit request. Please try again.';
                console.error(error);
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
