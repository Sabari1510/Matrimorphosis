import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const expectedRole = route.data['role'];
  const currentRole = authService.getRole();

  // If there's no role selected in this session, redirect to the role selector immediately.
  if (!authService.isLoggedIn()) {
    snackBar.open('Please select a role before accessing this page.', 'OK', {
      duration: 3000,
    });
    return router.parseUrl('/select-role');
  }

  // If an expected role exists, only allow access when it matches the current role.
  if (expectedRole && currentRole === expectedRole) {
    return true;
  }

  const message = expectedRole
    ? `Access denied: only '${expectedRole}' can access this page.`
    : 'Access denied: Unauthorized role.';

  snackBar.open(message, 'OK', { duration: 4000 });

  // Always send unauthorized users back to role selector to choose a role explicitly
  return router.parseUrl('/select-role');
};
