import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MaintenanceService } from '../../services/maintenance.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSelectModule, MatButtonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  requests: any[] = [];

  technicians = [
    { id: 2, name: 'Ravi Kumar' }, // TEMP (from DB)
  ];

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.maintenanceService.getAllRequests().subscribe((res: any) => {
      this.requests = res.data || [];
    });
  }

  assign(requestId: number, technicianId: number) {
    if (!technicianId) {
      alert('Please select a technician before assigning');
      return;
    }

    this.maintenanceService
      .assignTechnician(requestId, technicianId)
      .subscribe({
        next: () => {
          alert('Technician assigned');
          this.loadRequests();
        },
        error: () => alert('Assignment failed'),
      });
  }
}
