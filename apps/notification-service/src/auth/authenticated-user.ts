export interface AuthenticatedUser {
  id: number;
  username: string;
  email?: string;
  role: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
