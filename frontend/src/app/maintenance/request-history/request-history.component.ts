import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { MaintenanceRequest } from '../../models/models';
import { RequestModalComponent } from '../../shared/request-modal/request-modal.component';

@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, RequestModalComponent],
  templateUrl: './request-history.component.html',
  styleUrl: './request-history.component.css'
})
export class RequestHistoryComponent implements OnInit {
  requests: MaintenanceRequest[] = [];
  selectedDetailRequest: MaintenanceRequest | null = null;
  userId: number = 0;
  isLoading = true;

  constructor(
    private requestService: RequestService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUser()?.id || 0;
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.requestService.getRequests().subscribe({
      next: (requests: any[]) => {
        // Map backend response to MaintenanceRequest if needed, or assume it matches enough
        this.requests = requests as MaintenanceRequest[];
        this.requests.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
      }
    });
  }

  viewRequestDetails(request: MaintenanceRequest): void {
    this.selectedDetailRequest = request;
  }

  closeDetailModal(): void {
    this.selectedDetailRequest = null;
  }

  deleteRequest(event: Event, requestId: number): void {
    event.stopPropagation(); // Prevent opening modal

    if (confirm('Are you sure you want to delete this maintenance request?')) {
      this.requestService.deleteRequest(requestId).subscribe({
        next: () => {
          this.requests = this.requests.filter(r => r.id !== requestId);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete request');
        }
      });
    }
  }

  formatStatus(status: string): string {
    return status.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'hvac': 'HVAC',
      'appliance': 'Appliance',
      'security': 'Security',
      'cleaning': 'Cleaning',
      'painting': 'Painting',
      'structural': 'Structural',
      'other': 'Other'
    };
    return labels[category] || category;
  }

  getMediaUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('/uploads/')) {
      return `http://localhost:3000${path}`;
    }
    return `http://localhost:3000/api/media/${path}`;
  }
}
