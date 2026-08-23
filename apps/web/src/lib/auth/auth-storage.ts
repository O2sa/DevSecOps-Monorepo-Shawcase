const ACCESS_TOKEN_KEY = 'devsecops_access_token';
const REFRESH_TOKEN_KEY = 'devsecops_refresh_token';

class AuthStorage {
  private memoryStore: Record<string, string> = {};
  private onUnauthorizedListeners: Array<() => void> = [];

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      } catch {
        return this.memoryStore[ACCESS_TOKEN_KEY] || null;
      }
    }
    return this.memoryStore[ACCESS_TOKEN_KEY] || null;
  }

  setAccessToken(token: string): void {
    this.memoryStore[ACCESS_TOKEN_KEY] = token;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } catch {
        // Fallback to memoryStore
      }
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      } catch {
        return this.memoryStore[REFRESH_TOKEN_KEY] || null;
      }
    }
    return this.memoryStore[REFRESH_TOKEN_KEY] || null;
  }

  setRefreshToken(token: string): void {
    this.memoryStore[REFRESH_TOKEN_KEY] = token;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } catch {
        // Fallback to memoryStore
      }
    }
  }

  clear(): void {
    this.memoryStore = {};
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // Fallback
      }
    }
  }

  onUnauthorized(listener: () => void): () => void {
    this.onUnauthorizedListeners.push(listener);
    return () => {
      this.onUnauthorizedListeners = this.onUnauthorizedListeners.filter((l) => l !== listener);
    };
  }

  notifyUnauthorized(): void {
    this.clear();
    for (const listener of this.onUnauthorizedListeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying unauthorized listener', err);
      }
    }
  }
}

export const authStorage = new AuthStorage();
