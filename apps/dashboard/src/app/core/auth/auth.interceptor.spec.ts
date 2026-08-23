import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { getToken: jest.Mock; logout: jest.Mock };

  beforeEach(() => {
    authServiceMock = {
      getToken: jest.fn(),
      logout: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Authorization header for backend microservices when token is available', () => {
    authServiceMock.getToken.mockReturnValue('mock-admin-jwt-token');

    httpClient.get(`${environment.ordersServiceUrl}/api/orders`).subscribe();

    const req = httpMock.expectOne(`${environment.ordersServiceUrl}/api/orders`);
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-admin-jwt-token');
    req.flush([]);
  });

  it('should NOT attach Authorization header to external third-party requests', () => {
    authServiceMock.getToken.mockReturnValue('mock-admin-jwt-token');

    httpClient.get('https://api.thirdparty.com/external-resource').subscribe();

    const req = httpMock.expectOne('https://api.thirdparty.com/external-resource');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should call authService.logout() on 401 Unauthorized from backend service', () => {
    authServiceMock.getToken.mockReturnValue('expired-token');

    httpClient.get(`${environment.ordersServiceUrl}/api/orders`).subscribe({
      error: () => {
        expect(authServiceMock.logout).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne(`${environment.ordersServiceUrl}/api/orders`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
