import jwt from 'jsonwebtoken';
import { environment } from '../src/config/environment';

export function generateTestToken(payload: {
  userId?: number | null;
  username?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
  expiresIn?: string | number;
  secret?: string;
}): string {
  const secret = payload.secret || environment.jwtSecret;
  const tokenPayload: Record<string, any> = {
    username: payload.username || 'testuser',
    email: payload.email || 'testuser@example.com',
    role: payload.role || 'user',
    is_admin: payload.isAdmin !== undefined ? payload.isAdmin : false,
  };

  if (payload.userId !== undefined) {
    tokenPayload.user_id = payload.userId;
  }

  return jwt.sign(tokenPayload, secret, {
    algorithm: 'HS256',
    expiresIn: payload.expiresIn !== undefined ? (payload.expiresIn as any) : '1h',
  });
}

export function generateUserToken(userId: number, username: string = 'user'): string {
  return generateTestToken({
    userId,
    username,
    role: 'user',
    isAdmin: false,
  });
}

export function generateAdminToken(userId: number, username: string = 'admin'): string {
  return generateTestToken({
    userId,
    username,
    role: 'admin',
    isAdmin: true,
  });
}
