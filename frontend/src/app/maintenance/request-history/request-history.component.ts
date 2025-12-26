import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { MaintenanceRequest } from '../../models/models';

@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './request-history.component.html',
  styleUrl: './request-history.component.css'
})
export class RequestHistoryComponent implements OnInit {
  requests: MaintenanceRequest[] = [];
  isLoading = true;

  constructor(
    private requestService: RequestService,
    private authService: AuthService
  ) { }

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
}
