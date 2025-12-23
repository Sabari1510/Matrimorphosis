import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../services/maintenance.service';

@Component({
  selector: 'app-maintenance-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './maintenance-request.component.html',
  styleUrls: ['./maintenance-request.component.css'],
})
export class MaintenanceRequestComponent {
  category = '';
  description = '';

  constructor(
    private maintenanceService: MaintenanceService,
    private snackBar: MatSnackBar
  ) {}

  submitRequest() {
    if (!this.category || !this.description) {
      this.snackBar.open('Category and description are required', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = {
      resident_id: 3, // ✅ EXISTS IN USERS TABLE
      category: this.category,
      description: this.description,
      media: null,
    };

    this.maintenanceService.createRequest(payload).subscribe({
      next: () => {
        this.snackBar.open('Request submitted successfully', 'Close', {
          duration: 3000,
        });
        this.category = '';
        this.description = '';
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to submit request', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
