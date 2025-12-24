import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './role-selector.component.html',
})
export class RoleSelectorComponent {
  constructor(private auth: AuthService, private router: Router) {}

  loginAs(role: UserRole) {
    this.auth.setRole(role);

    if (role === 'resident') this.router.navigate(['/maintenance/new']);
    if (role === 'technician') this.router.navigate(['/technician/dashboard']);
    if (role === 'admin') this.router.navigate(['/admin/dashboard']);
  }
}
