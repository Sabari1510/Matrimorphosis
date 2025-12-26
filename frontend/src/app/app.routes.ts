import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ResidentDashboardComponent } from './dashboards/resident-dashboard/resident-dashboard.component';
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';
import { TechnicianDashboardComponent } from './dashboards/technician-dashboard/technician-dashboard.component';
import { MaintenanceRequestComponent } from './maintenance/maintenance-request/maintenance-request.component';
import { RequestHistoryComponent } from './maintenance/request-history/request-history.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Default redirect to login
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // Authentication routes
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },

    // Maintenance routes (Mandatory as per specification)
    {
        path: 'maintenance/new',
        component: MaintenanceRequestComponent,
        canActivate: [authGuard],
        data: { roles: ['Resident', 'Admin'] }
    },
    {
        path: 'maintenance/history',
        component: RequestHistoryComponent,
        canActivate: [authGuard],
        data: { roles: ['Resident', 'Admin', 'Technician'] }
    },

    // Dashboard routes (Mandatory as per specification)
    {
        path: 'technician/dashboard',
        component: TechnicianDashboardComponent,
        canActivate: [authGuard],
        data: { roles: ['Technician', 'Admin'] }
    },
    {
        path: 'admin/dashboard',
        component: AdminDashboardComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin'] }
    },

    // Additional route - Resident dashboard
    {
        path: 'resident-dashboard',
        component: ResidentDashboardComponent,
        canActivate: [authGuard],
        data: { roles: ['Resident', 'Admin'] }
    },

    // Wildcard route - redirect to login
    { path: '**', redirectTo: '/login' }
];
