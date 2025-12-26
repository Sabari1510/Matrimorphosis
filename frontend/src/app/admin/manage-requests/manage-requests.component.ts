import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestModalComponent } from '../../shared/request-modal/request-modal.component';
import { RequestService } from '../../services/request.service';
import { UserService } from '../../services/user.service';
import { MaintenanceRequest, User } from '../../models/models';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, RequestModalComponent],
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

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedCategory = '';

  constructor(
    private requestService: RequestService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.requestService.getRequests().subscribe({
      next: (requests: any[]) => {
        this.allRequests = requests as MaintenanceRequest[];
        this.applyFilters();
      },
      error: (err) => console.error('Error loading requests:', err)
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

  assignTechnician(techId: number): void {
    if (!this.selectedRequest) return;

    this.requestService.assignTechnician(this.selectedRequest.id, techId).subscribe({
      next: () => {
        alert('Technician assigned successfully!');
        this.closeAssignModal();
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to assign technician')
    });
  }

  deleteRequest(event: Event, id: number): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this maintenance request?')) {
      this.requestService.deleteRequest(id).subscribe({
        next: () => {
          alert('Request deleted successfully');
          this.loadData();
        },
        error: (err) => alert('Failed to delete request')
      });
    }
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }
}
