import { Notification, NotificationType } from './notification.model';

export interface NotificationRepository {
  create(data: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
  }): Promise<Notification>;
  findByUserId(userId: number): Promise<Notification[]>;
  findUnreadByUserId(userId: number): Promise<Notification[]>;
  findById(id: number): Promise<Notification | null>;
  markAsRead(id: number, userId: number): Promise<Notification | null>;
  clear(): Promise<void>;
}

export class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: Notification[] = [];
  private nextId = 1;

  async create(data: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
  }): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return { ...notification };
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return this.notifications
      .filter((n) => n.userId === userId)
      .map((n) => ({ ...n }))
      .sort((a, b) => a.id - b.id);
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    return this.notifications
      .filter((n) => n.userId === userId && !n.read)
      .map((n) => ({ ...n }))
      .sort((a, b) => a.id - b.id);
  }

  async findById(id: number): Promise<Notification | null> {
    const found = this.notifications.find((n) => n.id === id);
    return found ? { ...found } : null;
  }

  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    const notification = this.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notification) {
      return null;
    }
    notification.read = true;
    return { ...notification };
  }

  async clear(): Promise<void> {
    this.notifications = [];
    this.nextId = 1;
  }
}

export const notificationRepository = new InMemoryNotificationRepository();
