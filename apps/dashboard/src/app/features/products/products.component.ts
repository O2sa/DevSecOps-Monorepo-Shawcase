import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { OrdersApiService } from '../../core/api/orders-api.service';
import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: [],
})
export class ProductsComponent implements OnInit {
  private ordersApi = inject(OrdersApiService);

  products: Product[] = [];
  productOrderCounts: Record<number, number> = {};
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.fetchProductsAndAnalytics();
  }

  fetchProductsAndAnalytics(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      products: this.ordersApi.getProducts(),
      orders: this.ordersApi.getAllOrders(),
    }).subscribe({
      next: ({ products, orders }) => {
        this.products = products;
        this.productOrderCounts = {};
        orders.forEach((order) => {
          if (order.product && order.product.id) {
            this.productOrderCounts[order.product.id] =
              (this.productOrderCounts[order.product.id] || 0) + (order.quantity || 1);
          }
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || err.error?.detail || 'Failed to retrieve product inventory.';
      },
    });
  }
}
