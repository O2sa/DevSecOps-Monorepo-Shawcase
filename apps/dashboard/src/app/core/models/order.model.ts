import { Product } from './product.model';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED';

export interface Order {
  id: number;
  userId?: number;
  product: Product;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
