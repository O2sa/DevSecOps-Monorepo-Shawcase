import { Request, Response, NextFunction } from 'express';
import { notificationService, NotificationService } from './notification.service';

export class NotificationController {
  constructor(private readonly service: NotificationService = notificationService) {}

  getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const notifications = await this.service.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (err) {
      next(err);
    }
  };

  getUnreadNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const notifications = await this.service.getUserUnreadNotifications(userId);
      res.status(200).json(notifications);
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const updated = await this.service.markNotificationAsRead(id, userId);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };
}

export const notificationController = new NotificationController();
