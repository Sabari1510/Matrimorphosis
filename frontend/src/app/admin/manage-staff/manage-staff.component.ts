import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { RequestService } from '../../services/request.service';
import { User, MaintenanceRequest } from '../../models/models';

@Component({
  selector: 'app-manage-staff',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    NavbarComponent
  ],
  templateUrl: './manage-staff.component.html',
  styleUrl: './manage-staff.component.css'
})
export class ManageStaffComponent implements OnInit {
  staffList: any[] = [];
  filteredStaff: any[] = [];
  pendingTechnicians: any[] = []; // NEW: pending for approval
  allRequests: MaintenanceRequest[] = [];
  isLoading = false;

  searchQuery = '';
  selectedSpecialization = '';

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private requestService: RequestService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.requestService.getRequests().subscribe({
      next: (requests: any[]) => {
        this.allRequests = requests as MaintenanceRequest[];
        this.fetchTechnicians();
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.isLoading = false;
        this.showNotification('Failed to load data', 'error');
      }
    });
  }

  fetchTechnicians(): void {
    // Fetch ALL technicians (including pending) for manage staff
    this.userService.getAllTechnicians().subscribe({
      next: (technicians) => {
        // Separate verified and pending
        const verified = technicians.filter(t => t.verified);
        this.pendingTechnicians = technicians.filter(t => !t.verified);

        this.staffList = verified.map(tech => {
          const assignedRequests = this.allRequests.filter(r => r.technician_id === tech.id);
          const completedRequests = assignedRequests.filter(r => r.status === 'Resolved');

          const ratings = completedRequests
            .filter(r => r.feedback_rating != null && r.feedback_rating > 0)
            .map(r => r.feedback_rating as number);

          const avgRating = ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length) : 0;

          return {
            ...tech,
            initials: this.getInitials(tech.name),
            assigned: assignedRequests.length,
            completed: completedRequests.length,
            avgRating: avgRating
          };
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading technicians:', err);
        this.isLoading = false;
        this.showNotification('Failed to load technicians', 'error');
      }
    });
  }

  applyFilters(): void {
    this.filteredStaff = this.staffList.filter(staff => {
      const matchesSearch = !this.searchQuery ||
        staff.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        staff.employee_id?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesSpec = !this.selectedSpecialization || staff.specialization === this.selectedSpecialization;

      return matchesSearch && matchesSpec;
    });
  }

  deleteStaff(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Staff Member',
        message: 'Are you sure you want to delete this staff member? This will remove their account and all associated data.',
        confirmText: 'Delete',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteStaff(id).subscribe({
          next: () => {
            this.showNotification('Staff member deleted successfully', 'success');
            this.loadData();
          },
          error: (err) => this.showNotification('Failed to delete staff member', 'error')
        });
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  /** Approve a pending technician */
  approveTechnician(id: number): void {
    this.userService.verifyTechnician(id).subscribe({
      next: () => {
        this.showNotification('Technician approved successfully', 'success');
        this.loadData();
      },
      error: (err) => this.showNotification('Failed to approve technician', 'error')
    });
  }

  /** Reject (delete) a pending technician */
  rejectTechnician(id: number): void {
    if (confirm('Are you sure you want to reject this technician application?')) {
      this.adminService.deleteStaff(id).subscribe({
        next: () => {
          this.showNotification('Technician rejected', 'success');
          this.loadData();
        },
        error: (err) => this.showNotification('Failed to reject technician', 'error')
      });
    }
  }

  /** Get media URL for technician photo */
  getMediaUrl(path: string | null): string {
    if (!path) return '';
    // If it starts with /uploads, it's a legacy disk path
    if (path.startsWith('/uploads/')) {
      return `http://localhost:3000${path}`;
    }
    // Otherwise assume it's a MongoDB ID
    return `http://localhost:3000/api/media/${path}`;
  }
}
