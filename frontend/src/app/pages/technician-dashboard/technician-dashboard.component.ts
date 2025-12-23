import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../services/maintenance.service';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './technician-dashboard.component.html',
})
export class TechnicianDashboardComponent implements OnInit {
  requests: any[] = [];
  technicianId = 2; // 👈 Ravi Kumar (from users table)

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.maintenanceService
      .getRequestsByTechnician(this.technicianId)
      .subscribe((res: any) => {
        this.requests = res.data;
      });
  }

  updateStatus(requestId: number, status: string) {
    this.maintenanceService
      .updateRequestStatus(requestId, status)
      .subscribe(() => this.loadRequests());
  }
}
