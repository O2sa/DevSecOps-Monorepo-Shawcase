export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | string;
  is_admin?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
}

export interface DecodedJwtPayload {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_admin: boolean;
  exp?: number;
  iat?: number;
}
