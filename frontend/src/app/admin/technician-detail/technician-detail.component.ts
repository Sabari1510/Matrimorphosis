import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-technician-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './technician-detail.component.html',
  styleUrl: './technician-detail.component.css'
})
export class TechnicianDetailComponent implements OnInit {
  technician: any = null;
  technicianId: number = 0;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.technicianId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTechnicianDetails();
  }

  loadTechnicianDetails(): void {
    this.adminService.getPendingTechnicians().subscribe({
      next: (technicians) => {
        this.technician = technicians.find(t => t.id === this.technicianId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading technician:', err);
        this.isLoading = false;
      }
    });
  }

  approveTechnician(): void {
    if (confirm(`Approve ${this.technician.name} as a technician?`)) {
      this.adminService.approveTechnician(this.technicianId).subscribe({
        next: () => {
          alert('Technician approved successfully!');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          console.error('Error approving technician:', err);
          alert('Failed to approve technician');
        }
      });
    }
  }

  rejectTechnician(): void {
    if (confirm(`Reject and delete ${this.technician.name}'s account?`)) {
      this.adminService.rejectTechnician(this.technicianId).subscribe({
        next: () => {
          alert('Technician rejected');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          console.error('Error rejecting technician:', err);
          alert('Failed to reject technician');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  getMediaUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('/uploads/')) {
      return `http://localhost:3000${path}`;
    }
    return `http://localhost:3000/api/media/${path}`;
  }
}
