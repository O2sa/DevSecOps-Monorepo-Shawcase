import { Request, Response, NextFunction } from 'express';
import { notificationService, NotificationService } from '../notification/notification.service';

export class InternalController {
  constructor(private readonly service: NotificationService = notificationService) {}

  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, type, title, message } = req.body;
      const created = await this.service.createNotification({
        userId,
        type,
        title,
        message,
      });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };
}

export const internalController = new InternalController();
