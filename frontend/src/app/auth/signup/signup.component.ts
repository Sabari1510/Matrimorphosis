import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css'
})
export class SignupComponent {
    formData = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'Resident', // Default to Resident
        apartmentNumber: '',
        phoneNumber: '',
        employeeId: ''
    };

    errorMessage = '';
    isSubmitting = false;
    selectedPhoto: File | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onPhotoSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                this.errorMessage = 'Please select an image file';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'File size must be less than 5MB';
                return;
            }
            this.selectedPhoto = file;
            this.errorMessage = '';
        }
    }

    onSubmit(): void {
        // Validation
        if (!this.formData.firstName || !this.formData.email || !this.formData.password) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (this.formData.password !== this.formData.confirmPassword) {
            this.errorMessage = 'Passwords do not match';
            return;
        }

        // Validate technician-specific fields
        if (this.formData.role === 'Technician') {
            if (!this.formData.employeeId || !this.formData.phoneNumber || !this.selectedPhoto) {
                this.errorMessage = 'Technicians must provide Employee ID, Phone, and Photo';
                return;
            }
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        // Create FormData to send file
        const formData = new FormData();
        formData.append('name', `${this.formData.firstName} ${this.formData.lastName}`);
        formData.append('contact_info', this.formData.email);
        formData.append('password', this.formData.password);
        formData.append('role', this.formData.role);

        // Add technician-specific fields
        if (this.formData.role === 'Technician') {
            formData.append('employee_id', this.formData.employeeId);
            formData.append('phone', this.formData.phoneNumber);
            if (this.selectedPhoto) {
                formData.append('photo', this.selectedPhoto);
            }
        }

        this.authService.register(formData).subscribe({
            next: () => {
                this.isSubmitting = false;
                const message = this.formData.role === 'Technician'
                    ? 'Registration successful! Your account is pending admin verification.'
                    : 'Registration successful! Please login.';
                alert(message);
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = err.error?.message || 'Registration failed';
                console.error('Signup error:', err);
            }
        });
    }
}
