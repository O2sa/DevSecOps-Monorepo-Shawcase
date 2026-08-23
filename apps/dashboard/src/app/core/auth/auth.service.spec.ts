import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStorageService } from './auth-storage.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageMock: {
    getAccessToken: jest.Mock;
    setAccessToken: jest.Mock;
    getRefreshToken: jest.Mock;
    setRefreshToken: jest.Mock;
    clear: jest.Mock;
  };
  let routerMock: { navigate: jest.Mock };

  // Helper to create valid base64 payload JWT
  const createMockToken = (payload: object) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.mock-signature`;
  };

  beforeEach(() => {
    storageMock = {
      getAccessToken: jest.fn(),
      setAccessToken: jest.fn(),
      getRefreshToken: jest.fn(),
      setRefreshToken: jest.fn(),
      clear: jest.fn(),
    };
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: AuthStorageService, useValue: storageMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate admin user and update signals correctly', () => {
    const adminPayload = {
      user_id: 1,
      username: 'admin',
      email: 'admin@devsecops.local',
      role: 'admin',
      is_admin: true,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = createMockToken(adminPayload);

    service.login({ username: 'admin', password: 'Password123!' }).subscribe((res) => {
      expect(res.access).toBe(token);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isAdmin()).toBe(true);
      expect(service.currentUser()?.username).toBe('admin');
      expect(service.currentUser()?.role).toBe('admin');
    });

    const req = httpMock.expectOne(`${environment.identityServiceUrl}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      access: token,
      refresh: 'mock-refresh-token',
    });

    expect(storageMock.setAccessToken).toHaveBeenCalledWith(token);
    expect(storageMock.setRefreshToken).toHaveBeenCalledWith('mock-refresh-token');
  });

  it('should reject non-admin users attempting to log into operations dashboard', () => {
    const regularUserPayload = {
      user_id: 2,
      username: 'regular_user',
      email: 'user@devsecops.local',
      role: 'user',
      is_admin: false,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = createMockToken(regularUserPayload);

    service.login({ username: 'regular_user', password: 'Password123!' }).subscribe({
      next: () => fail('Expected login to fail for non-admin user'),
      error: (err) => {
        expect(err.message).toContain('Access denied. Administrator privileges required');
        expect(service.isAuthenticated()).toBe(false);
        expect(service.isAdmin()).toBe(false);
      },
    });

    const req = httpMock.expectOne(`${environment.identityServiceUrl}/api/auth/login`);
    req.flush({
      access: token,
      refresh: 'mock-refresh-token',
    });
  });

  it('should clear stored credentials on logout and navigate to /login', () => {
    service.logout();

    expect(storageMock.clear).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
