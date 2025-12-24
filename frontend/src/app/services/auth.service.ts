import { Injectable } from '@angular/core';

export type UserRole = 'resident' | 'technician' | 'admin';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private roleKey = 'user_role';

  setRole(role: UserRole) {
    localStorage.setItem(this.roleKey, role);
  }

  getRole(): UserRole | null {
    return localStorage.getItem(this.roleKey) as UserRole | null;
  }

  hasRole(expectedRole: UserRole): boolean {
    return this.getRole() === expectedRole;
  }

  logout() {
    localStorage.removeItem(this.roleKey);
  }
}
