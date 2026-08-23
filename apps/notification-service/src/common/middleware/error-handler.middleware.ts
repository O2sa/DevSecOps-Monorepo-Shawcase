import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const responseBody: { message: string; errors?: Record<string, string> } = {
      message: err.message,
    };
    if (err.errors) {
      responseBody.errors = err.errors;
    }
    res.status(err.statusCode).json(responseBody);
    return;
  }

  // Fallback for unexpected errors (never leak stack trace or internal details)
  console.error('[Notification Service Error]', err);
  res.status(500).json({
    message: 'An unexpected server error occurred',
  });
}
