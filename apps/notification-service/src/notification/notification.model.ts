export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
