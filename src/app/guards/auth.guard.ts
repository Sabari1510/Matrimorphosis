import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        // Check if route has role requirements
        const requiredRoles = route.data['roles'] as string[];

        if (requiredRoles && !authService.hasAnyRole(requiredRoles)) {
            // User doesn't have required role, redirect to appropriate dashboard
            const userRole = authService.currentUserValue?.role;
            router.navigate([`/${userRole}-dashboard`]);
            return false;
        }

        return true;
    }

    // Not authenticated, redirect to login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
