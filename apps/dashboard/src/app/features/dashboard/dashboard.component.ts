import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrdersApiService } from '../../core/api/orders-api.service';
import { IdentityApiService } from '../../core/api/identity-api.service';
import { Order } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit {
  private ordersApi = inject(OrdersApiService);
  private identityApi = inject(IdentityApiService);

  isLoading = true;
  errorMessage: string | null = null;

  orders: Order[] = [];
  products: Product[] = [];
  users: User[] = [];

  // Metrics
  totalRevenue = 0;
  pendingCount = 0;
  processingCount = 0;
  completedCount = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      orders: this.ordersApi.getAllOrders(),
      products: this.ordersApi.getProducts(),
      users: this.identityApi.getUsers()
    }).subscribe({
      next: ({ orders, products, users }) => {
        this.orders = orders;
        this.products = products;
        this.users = users;

        this.calculateMetrics();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || err.error?.message || 'Failed to load operational dashboard data.';
      }
    });
  }

  private calculateMetrics(): void {
    this.pendingCount = this.orders.filter((o) => o.status === 'PENDING').length;
    this.processingCount = this.orders.filter((o) => o.status === 'PROCESSING').length;
    this.completedCount = this.orders.filter((o) => o.status === 'COMPLETED').length;

    this.totalRevenue = this.orders.reduce((acc, order) => {
      const price = order.product?.price ? Number(order.product.price) : 0;
      return acc + price * (order.quantity || 1);
    }, 0);
  }

  get recentOrders(): Order[] {
    return [...this.orders].reverse().slice(0, 5);
  }
}
