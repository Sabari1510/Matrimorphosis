import { Injectable } from '@angular/core';

export type UserRole = 'resident' | 'technician' | 'admin';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private roleKey = 'user_role';

  // Save role in session storage so selecting a role is required each session
  setRole(role: UserRole) {
    sessionStorage.setItem(this.roleKey, role);
  }

  // Returns role only if it was selected in the current session
  getRole(): UserRole | null {
    return sessionStorage.getItem(this.roleKey) as UserRole | null;
  }

  hasRole(expectedRole: UserRole): boolean {
    return this.getRole() === expectedRole;
  }

  isLoggedIn(): boolean {
    return this.getRole() !== null;
  }

  logout() {
    sessionStorage.removeItem(this.roleKey);
  }
}
