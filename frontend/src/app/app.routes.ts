import { Routes } from '@angular/router';
import { MaintenanceRequestComponent } from './pages/maintenance-request/maintenance-request.component';
import { RequestHistoryComponent } from './pages/request-history/request-history.component';
import { TechnicianDashboardComponent } from './pages/technician-dashboard/technician-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { roleGuard } from './guards/role.guard';
import { RoleSelectorComponent } from './pages/role-selector/role-selector.component';


export const routes: Routes = [
  { path: '', redirectTo: 'select-role', pathMatch: 'full' },
  { path: 'select-role', component: RoleSelectorComponent },

  // Resident
  {
    path: 'maintenance/new',
    component: MaintenanceRequestComponent,
    canActivate: [roleGuard],
    data: { role: 'resident' },
  },
  {
    path: 'maintenance/history',
    component: RequestHistoryComponent,
    canActivate: [roleGuard],
    data: { role: 'resident' },
  },
  {
    path: 'feedback/:requestId',
    component: FeedbackComponent,
    canActivate: [roleGuard],
    data: { role: 'resident' },
  },

  // Technician
  {
    path: 'technician/dashboard',
    component: TechnicianDashboardComponent,
    canActivate: [roleGuard],
    data: { role: 'technician' },
  },

  // Admin
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [roleGuard],
    data: { role: 'admin' },
  },
];
