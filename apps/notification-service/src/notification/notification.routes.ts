import { Router } from 'express';
import { authenticateJwt } from '../auth/jwt.middleware';
import { notificationController } from './notification.controller';

const router = Router();

// Apply JWT authentication to all user-facing notification endpoints
router.use(authenticateJwt);

router.get('/', notificationController.getMyNotifications);
router.get('/unread', notificationController.getUnreadNotifications);
router.patch('/:id/read', notificationController.markAsRead);

export const notificationRoutes = router;
