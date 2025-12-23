import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../services/maintenance.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent {
  requestId!: number;
  rating: number | null = null;

  ratings = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private maintenanceService: MaintenanceService,
    private snackBar: MatSnackBar
  ) {
    this.requestId = Number(this.route.snapshot.paramMap.get('requestId'));
  }

  submitFeedback() {
    if (!this.rating) {
      this.snackBar.open('Please select a rating', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.maintenanceService
      .submitFeedback(this.requestId, this.rating)
      .subscribe({
        next: () => {
          this.snackBar.open('Feedback submitted successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Feedback submission failed', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
