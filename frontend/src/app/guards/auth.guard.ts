import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        const requiredRoles = route.data['roles'] as string[];
        const userRole = authService.getUserRole();

        if (requiredRoles && !requiredRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on actual role
            if (userRole === 'admin') router.navigate(['/admin/dashboard']);
            else if (userRole === 'staff') router.navigate(['/technician/dashboard']);
            else router.navigate(['/resident-dashboard']);
            return false;
        }

        return true;
    }

    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
