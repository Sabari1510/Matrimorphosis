import { Routes } from '@angular/router';
import { MaintenanceRequestComponent } from './pages/maintenance-request/maintenance-request.component';
import { RequestHistoryComponent } from './pages/request-history/request-history.component';
import { TechnicianDashboardComponent } from './pages/technician-dashboard/technician-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';

export const routes: Routes = [
  { path: '', redirectTo: 'maintenance/new', pathMatch: 'full' },
  { path: 'maintenance/new', component: MaintenanceRequestComponent },
  { path: 'maintenance/history', component: RequestHistoryComponent },
  { path: 'technician/dashboard', component: TechnicianDashboardComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'feedback/:requestId', component: FeedbackComponent },
];
