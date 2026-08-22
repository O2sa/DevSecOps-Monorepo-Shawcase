import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { environment } from '../config/environment';
import { UnauthorizedError } from '../common/errors';
import { AuthenticatedUser } from './authenticated-user';

export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, environment.jwtSecret, {
      algorithms: ['HS256'],
    }) as JwtPayload;

    const rawUserId = decoded.user_id;
    const userId = typeof rawUserId === 'number' ? rawUserId : parseInt(rawUserId, 10);

    if (isNaN(userId) || userId <= 0) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const username = decoded.username || (decoded.sub as string) || '';
    const email = decoded.email as string | undefined;
    const role = (decoded.role as string) || 'user';
    const isAdmin = Boolean(decoded.is_admin) || role.toLowerCase() === 'admin';

    const authenticatedUser: AuthenticatedUser = {
      id: userId,
      username,
      email,
      role,
      isAdmin,
    };

    req.user = authenticatedUser;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Authentication required'));
  }
}
