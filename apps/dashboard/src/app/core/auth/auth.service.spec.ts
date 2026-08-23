import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStorageService } from './auth-storage.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageSpy: jasmine.SpyObj<AuthStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Helper to create valid base64 payload JWT
  const createMockToken = (payload: object) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.mock-signature`;
  };

  beforeEach(() => {
    const sSpy = jasmine.createSpyObj('AuthStorageService', [
      'getAccessToken',
      'setAccessToken',
      'getRefreshToken',
      'setRefreshToken',
      'clear'
    ]);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: AuthStorageService, useValue: sSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageSpy = TestBed.inject(AuthStorageService) as jasmine.SpyObj<AuthStorageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const token = createMockToken(adminPayload);

    service.login({ username: 'admin', password: 'Password123!' }).subscribe((res) => {
      expect(res.access).toBe(token);
    });

    const req = httpMock.expectOne(`${environment.identityServiceUrl}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ access: token, refresh: 'refresh-token' });

    expect(storageSpy.setAccessToken).toHaveBeenCalledWith(token);
    expect(service.currentUser()?.username).toBe('admin');
    expect(service.currentUser()?.role).toBe('admin');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.isAdmin()).toBeTrue();
  });

  it('should decode regular user token and reflect non-admin status', () => {
    const userPayload = {
      user_id: 2,
      username: 'regular_user',
      email: 'user@devsecops.local',
      role: 'user',
      is_admin: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const token = createMockToken(userPayload);

    service.login({ username: 'regular_user', password: 'Password123!' }).subscribe();

    const req = httpMock.expectOne(`${environment.identityServiceUrl}/api/auth/login`);
    req.flush({ access: token });

    expect(service.currentUser()?.role).toBe('user');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.isAdmin()).toBeFalse();
  });

  it('should clear authentication state and redirect on logout', () => {
    service.logout();

    expect(storageSpy.clear).toHaveBeenCalled();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
