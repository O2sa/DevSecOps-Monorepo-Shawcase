import { NotificationType } from '../notification.model';

export interface NotificationResponseDto {
  id: number;
  userId?: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
