import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isBackendUrl =
    req.url.startsWith(environment.identityServiceUrl) ||
    req.url.startsWith(environment.ordersServiceUrl) ||
    req.url.startsWith(environment.notificationServiceUrl);

  let authReq = req;
  if (token && isBackendUrl && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isBackendUrl) {
        // Clear invalid authentication state and redirect to login
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
