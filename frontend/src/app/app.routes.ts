import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ResidentDashboardComponent } from './dashboards/resident-dashboard/resident-dashboard.component';
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';
import { TechnicianDashboardComponent } from './dashboards/technician-dashboard/technician-dashboard.component';
import { MaintenanceRequestComponent } from './maintenance/maintenance-request/maintenance-request.component';
import { RequestHistoryComponent } from './maintenance/request-history/request-history.component';
import { TechnicianDetailComponent } from './admin/technician-detail/technician-detail.component';
import { ManageRequestsComponent } from './admin/manage-requests/manage-requests.component';
import { ManageStaffComponent } from './admin/manage-staff/manage-staff.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Landing page as default
    { path: '', component: LandingComponent },

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
    {
        path: 'admin/technician-detail/:id',
        component: TechnicianDetailComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin'] }
    },
    {
        path: 'admin/manage-requests',
        component: ManageRequestsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin'] }
    },
    {
        path: 'admin/manage-staff',
        component: ManageStaffComponent,
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
