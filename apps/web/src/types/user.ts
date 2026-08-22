export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | string;
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}
