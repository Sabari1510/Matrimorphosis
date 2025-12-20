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
        role: 'resident',
        apartmentNumber: '',
        phoneNumber: ''
    };

    errorMessage = '';
    isSubmitting = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        // Validation
        if (!this.formData.firstName || !this.formData.lastName || !this.formData.email ||
            !this.formData.username || !this.formData.password) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (this.formData.password !== this.formData.confirmPassword) {
            this.errorMessage = 'Passwords do not match';
            return;
        }

        if (this.formData.password.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters';
            return;
        }

        if (this.formData.role === 'resident' && !this.formData.apartmentNumber) {
            this.errorMessage = 'Apartment number is required for residents';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        // In a real application, this would call an API to register the user
        // For now, we'll just simulate success and redirect to login
        setTimeout(() => {
            this.isSubmitting = false;
            alert('Registration successful! Please login with your credentials.');
            this.router.navigate(['/login']);
        }, 1000);
    }
}
