import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MaintenanceService } from '../../services/maintenance.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, MatTableModule],
  templateUrl: './request-history.component.html',
  styleUrls: ['./request-history.component.css'],
})
export class RequestHistoryComponent implements OnInit {
  requests: any[] = [];

  displayedColumns: string[] = [
    'id',
    'category',
    'description',
    'status',
    'created_at',
    'feedback'
  ];

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    const residentId = 3; // same test resident

    this.maintenanceService.getRequestsByResident(residentId).subscribe({
      next: (res: any) => {
        this.requests = res.data;
      },
      error: (err) => {
        console.error('Failed to load request history', err);
      },
    });
  }
}
