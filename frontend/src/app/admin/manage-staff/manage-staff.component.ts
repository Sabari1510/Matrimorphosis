import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { RequestService } from '../../services/request.service';
import { User, MaintenanceRequest } from '../../models/models';

@Component({
  selector: 'app-manage-staff',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './manage-staff.component.html',
  styleUrl: './manage-staff.component.css'
})
export class ManageStaffComponent implements OnInit {
  staffList: any[] = [];
  filteredStaff: any[] = [];
  allRequests: MaintenanceRequest[] = [];

  searchQuery = '';
  selectedSpecialization = '';

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private requestService: RequestService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.requestService.getRequests().subscribe({
      next: (requests: any[]) => {
        this.allRequests = requests as MaintenanceRequest[];
        this.fetchTechnicians();
      },
      error: (err) => console.error('Error loading requests:', err)
    });
  }

  fetchTechnicians(): void {
    this.userService.getTechnicians().subscribe({
      next: (technicians) => {
        this.staffList = technicians.map(tech => {
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
      },
      error: (err) => console.error('Error loading technicians:', err)
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
    if (confirm('Are you sure you want to delete this staff member? This will remove their account and all associated data.')) {
      this.adminService.deleteStaff(id).subscribe({
        next: () => {
          alert('Staff member deleted successfully');
          this.loadData();
        },
        error: (err) => alert('Failed to delete staff member')
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
