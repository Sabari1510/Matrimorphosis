import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getRole: () => null } },
        {
          provide: Router,
          useValue: { parseUrl: (u: string) => ({ toString: () => u }) },
        },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('redirects to /select-role when no role is selected', () => {
    const fakeRoute = { data: { role: 'resident' } } as any;

    // Mock AuthService to return null role
    const mockAuth = { getRole: () => null };
    TestBed.overrideProvider(AuthService, { useValue: mockAuth });

    const result = executeGuard(fakeRoute, null as any) as any;
    expect(result.toString()).toContain('/select-role');
  });

  it('allows resident to access resident-only routes', () => {
    const fakeRoute = { data: { role: 'resident' } } as any;
    const mockAuth = { getRole: () => 'resident' } as any;
    TestBed.overrideProvider(AuthService, { useValue: mockAuth });

    const result = executeGuard(fakeRoute, null as any) as any;
    expect(result).toBe(true);
  });

  it("redirects a technician trying to access resident's page to technician dashboard", () => {
    const fakeRoute = { data: { role: 'resident' } } as any;
    const mockAuth = { getRole: () => 'technician' } as any;
    TestBed.overrideProvider(AuthService, { useValue: mockAuth });

    const result = executeGuard(fakeRoute, null as any) as any;
    expect(result.toString()).toContain('/technician/dashboard');
  });
});
