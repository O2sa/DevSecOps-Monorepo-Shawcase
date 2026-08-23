import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {
  private readonly ACCESS_TOKEN_KEY = 'devsecops_admin_token';
  private readonly REFRESH_TOKEN_KEY = 'devsecops_admin_refresh_token';
  private memoryStore: Record<string, string> = {};

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
      } catch {
        return this.memoryStore[this.ACCESS_TOKEN_KEY] || null;
      }
    }
    return this.memoryStore[this.ACCESS_TOKEN_KEY] || null;
  }

  setAccessToken(token: string): void {
    this.memoryStore[this.ACCESS_TOKEN_KEY] = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      } catch {
        // Fallback
      }
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
      } catch {
        return this.memoryStore[this.REFRESH_TOKEN_KEY] || null;
      }
    }
    return this.memoryStore[this.REFRESH_TOKEN_KEY] || null;
  }

  setRefreshToken(token: string): void {
    this.memoryStore[this.REFRESH_TOKEN_KEY] = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      } catch {
        // Fallback
      }
    }
  }

  clear(): void {
    this.memoryStore = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      } catch {
        // Fallback
      }
    }
  }
}
