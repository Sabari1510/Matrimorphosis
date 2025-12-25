import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './technician-dashboard.component.html',
})
export class TechnicianDashboardComponent implements OnInit {
  requests: any[] = [];
  technicianId = 2; // 👈 Ravi Kumar (from users table)
  localNotes: { [key: number]: string } = {};
  localFiles: { [key: number]: File | null } = {};

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
    const notes = this.localNotes[requestId] || '';
    const file = this.localFiles[requestId] || null;

    const form = new FormData();
    form.append('status', status);
    if (notes) form.append('technician_notes', notes);
    if (file) form.append('technician_media', file, file.name);

    this.maintenanceService
      .updateRequestStatus(requestId, form)
      .subscribe(() => this.loadRequests());
  }

  onNotesChange(requestId: number, value: any) {
    this.localNotes[requestId] = String(value || '');
  }

  onFileChange(requestId: number, event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.localFiles[requestId] = file;
  }
}
