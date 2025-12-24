import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const currentRole = authService.getRole();

  if (currentRole === expectedRole) {
    return true;
  }

  alert('Access denied: Unauthorized role');

  // Redirect to a route appropriate for the user's current role to avoid navigation loops.
  if (currentRole === 'resident') {
    return router.parseUrl('/maintenance/new');
  }
  if (currentRole === 'technician') {
    return router.parseUrl('/technician/dashboard');
  }
  if (currentRole === 'admin') {
    return router.parseUrl('/admin/dashboard');
  }

  return router.parseUrl('/select-role');
};
