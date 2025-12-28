import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  isLoggedIn = false;
  dashboardRoute = '/login';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.dashboardRoute = this.getDashboardRoute();
    }
  }

  getDashboardRoute(): string {
    const role = this.authService.getUserRole();
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin/dashboard';
      case 'technician':
      case 'staff':
        return '/technician/dashboard';
      case 'resident':
        return '/resident-dashboard';
      default:
        return '/login';
    }
  }
}
