import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  let authServiceMock: { isAdmin: jest.Mock; isAuthenticated: jest.Mock };
  let router: Router;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = {
      isAdmin: jest.fn(),
      isAuthenticated: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should allow route activation for authenticated administrators', () => {
    authServiceMock.isAdmin.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result).toBe(true);
  });

  it('should redirect unauthenticated users to /login with returnUrl', () => {
    authServiceMock.isAdmin.mockReturnValue(false);
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result instanceof UrlTree).toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toContain('/login?returnUrl=%2Fdashboard');
  });

  it('should redirect non-admin authenticated users with forbidden error param', () => {
    authServiceMock.isAdmin.mockReturnValue(false);
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result instanceof UrlTree).toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toContain('/login?error=forbidden');
  });
});
