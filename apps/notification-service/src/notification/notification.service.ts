import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification, NotificationType } from './notification.model';
import { NotificationRepository, notificationRepository } from './notification.repository';
import { NotFoundError, ValidationError } from '../common/errors';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository = notificationRepository) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const errors: Record<string, string> = {};

    if (!dto.userId || typeof dto.userId !== 'number' || dto.userId <= 0) {
      errors.userId = 'must be a valid number greater than zero';
    }

    if (!dto.type || !Object.values(NotificationType).includes(dto.type)) {
      errors.type = `must be a valid notification type (${Object.values(NotificationType).join(', ')})`;
    }

    if (!dto.title || typeof dto.title !== 'string' || dto.title.trim().length === 0) {
      errors.title = 'must not be empty';
    }

    if (!dto.message || typeof dto.message !== 'string' || dto.message.trim().length === 0) {
      errors.message = 'must not be empty';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return this.repository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title.trim(),
      message: dto.message.trim(),
    });
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.repository.findByUserId(userId);
  }

  async getUserUnreadNotifications(userId: number): Promise<Notification[]> {
    return this.repository.findUnreadByUserId(userId);
  }

  async markNotificationAsRead(id: number, userId: number): Promise<Notification> {
    if (isNaN(id) || id <= 0) {
      throw new NotFoundError('Notification not found');
    }

    const updated = await this.repository.markAsRead(id, userId);
    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    return updated;
  }
}

export const notificationService = new NotificationService();
