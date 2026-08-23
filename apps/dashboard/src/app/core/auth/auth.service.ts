import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';
import { User, LoginRequest, LoginResponse, DecodedJwtPayload } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  public readonly isAdmin = computed(() => {
    const user = this.currentUserSignal();
    return !!user && (user.role === 'admin' || user.is_admin === true);
  });

  constructor(
    private http: HttpClient,
    private storage: AuthStorageService,
    private router: Router
  ) {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    const token = this.storage.getAccessToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload && !this.isTokenExpired(payload)) {
        this.currentUserSignal.set({
          id: payload.user_id,
          username: payload.username,
          email: payload.email,
          role: payload.role,
          is_admin: payload.is_admin,
        });
      } else {
        this.storage.clear();
        this.currentUserSignal.set(null);
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.identityServiceUrl}/api/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.storage.setAccessToken(response.access);
          if (response.refresh) {
            this.storage.setRefreshToken(response.refresh);
          }

          const payload = this.decodeToken(response.access);
          if (payload) {
            this.currentUserSignal.set({
              id: payload.user_id,
              username: payload.username,
              email: payload.email,
              role: payload.role,
              is_admin: payload.is_admin,
            });
          }
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.storage.clear();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.storage.getAccessToken();
  }

  decodeToken(token: string): DecodedJwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as DecodedJwtPayload;
    } catch {
      return null;
    }
  }

  private isTokenExpired(payload: DecodedJwtPayload): boolean {
    if (!payload.exp) {
      return false;
    }
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < currentTimeSeconds;
  }
}
