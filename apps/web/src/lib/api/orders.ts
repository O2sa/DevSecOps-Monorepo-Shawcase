import { config } from '../config';
import { apiClient } from './client';
import { Product } from '../../types/product';
import { Order, CreateOrderPayload } from '../../types/order';

export const ordersApi = {
  async getProducts(): Promise<Product[]> {
    return apiClient<Product[]>(`${config.ordersServiceUrl}/api/products`, {
      method: 'GET',
    });
  },

  async getProductById(id: number): Promise<Product> {
    return apiClient<Product>(`${config.ordersServiceUrl}/api/products/${id}`, {
      method: 'GET',
    });
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return apiClient<Order>(`${config.ordersServiceUrl}/api/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return apiClient<Order[]>(`${config.ordersServiceUrl}/api/orders/me`, {
      method: 'GET',
    });
  },
};
