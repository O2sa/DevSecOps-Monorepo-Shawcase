export type NotificationType = 'ORDER_CREATED' | string;

export interface Notification {
  id: number;
  userId?: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
