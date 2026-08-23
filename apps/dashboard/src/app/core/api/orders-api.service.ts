import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Order, OrderStatus, UpdateOrderStatusRequest } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  private readonly baseUrl = environment.ordersServiceUrl;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/api/products/${id}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders`);
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    const payload: UpdateOrderStatusRequest = { status };
    return this.http.patch<Order>(`${this.baseUrl}/api/orders/${orderId}/status`, payload);
  }
}
