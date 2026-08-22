import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { internalRoutes } from './internal/internal.routes';
import { notificationRoutes } from './notification/notification.routes';
import { errorHandler } from './common/middleware/error-handler.middleware';
import { NotFoundError } from './common/errors';

export function createApp(): Express {
  const app = express();

  // Security & body parsing middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Public Health Checks
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // Internal Routes (backend microservices)
  app.use('/internal', internalRoutes);

  // User-facing API Routes
  app.use('/api/notifications', notificationRoutes);

  // Catch-all 404 Handler
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError('Resource not found'));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
