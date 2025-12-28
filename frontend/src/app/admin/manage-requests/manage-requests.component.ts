import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestModalComponent } from '../../shared/request-modal/request-modal.component';
import { RequestService } from '../../services/request.service';
import { UserService } from '../../services/user.service';
import { MaintenanceRequest, User } from '../../models/models';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent,
    RequestModalComponent
  ],
  templateUrl: './manage-requests.component.html',
  styleUrl: './manage-requests.component.css'
})
export class ManageRequestsComponent implements OnInit {
  allRequests: MaintenanceRequest[] = [];
  filteredRequests: MaintenanceRequest[] = [];
  technicians: User[] = [];

  selectedRequest: MaintenanceRequest | null = null;
  showAssignModal = false;
  selectedDetailRequest: MaintenanceRequest | null = null;
  isLoading = false; // Added loading state

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedCategory = '';

  constructor(
    private requestService: RequestService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.requestService.getRequests().subscribe({
      next: (requests: any[]) => {
        this.allRequests = requests as MaintenanceRequest[];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.isLoading = false;
        this.showNotification('Failed to load requests', 'error');
      }
    });

    this.userService.getTechnicians().subscribe({
      next: (techs) => this.technicians = techs,
      error: (err) => console.error('Error loading technicians:', err)
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.allRequests.filter(req => {
      const matchesSearch = !this.searchQuery ||
        req.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        req.id.toString().includes(this.searchQuery);

      const matchesStatus = !this.selectedStatus || req.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || req.priority === this.selectedPriority;
      const matchesCategory = !this.selectedCategory || req.category === this.selectedCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }

  viewRequestDetails(request: MaintenanceRequest): void {
    this.selectedDetailRequest = request;
  }

  closeDetailModal(): void {
    this.selectedDetailRequest = null;
  }

  openAssignModal(request: MaintenanceRequest): void {
    if (request.status === 'Resolved') return;
    this.selectedRequest = request;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedRequest = null;
  }

  /**
   * Get technicians filtered by the selected request's category.
   * Shows technicians with matching specialization + general/other technicians.
   */
  get filteredTechnicians(): User[] {
    if (!this.selectedRequest || !this.selectedRequest.category) {
      return this.technicians;
    }

    const category = this.selectedRequest.category.toLowerCase();

    return this.technicians.filter(tech => {
      const spec = (tech.specialization || '').toLowerCase();
      // Include if specialization matches category OR if general/other
      return spec === category ||
        spec === 'general' ||
        spec === 'other' ||
        spec === '';
    });
  }

  assignTechnician(techId: number): void {
    if (!this.selectedRequest) return;

    this.requestService.assignTechnician(this.selectedRequest.id, techId).subscribe({
      next: () => {
        this.showNotification('Technician assigned successfully!', 'success');
        this.closeAssignModal();
        this.loadData();
      },
      error: (err) => this.showNotification(err.error?.message || 'Failed to assign technician', 'error')
    });
  }

  deleteRequest(event: Event, id: number): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this maintenance request?')) {
      this.requestService.deleteRequest(id).subscribe({
        next: () => {
          this.showNotification('Request deleted successfully', 'success');
          this.loadData();
        },
        error: (err) => this.showNotification('Failed to delete request', 'error')
      });
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }
}
