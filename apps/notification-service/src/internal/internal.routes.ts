import { Router } from 'express';
import { internalController } from './internal.controller';

const router = Router();

// Internal service-to-service creation endpoint
router.post('/notifications', internalController.createNotification);

export const internalRoutes = router;
