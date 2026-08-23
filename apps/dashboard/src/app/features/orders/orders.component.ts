import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersApiService } from '../../core/api/orders-api.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: []
})
export class OrdersComponent implements OnInit {
  private ordersApi = inject(OrdersApiService);

  orders: Order[] = [];
  selectedStatuses: Record<number, OrderStatus> = {};
  updatingOrderId: number | null = null;

  activeFilter: 'ALL' | OrderStatus = 'ALL';
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  readonly availableStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED'];

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.ordersApi.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.selectedStatuses = {};
        data.forEach((o) => {
          this.selectedStatuses[o.id] = o.status;
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.detail || 'Failed to retrieve orders from Orders Service.';
      }
    });
  }

  get filteredOrders(): Order[] {
    if (this.activeFilter === 'ALL') {
      return this.orders;
    }
    return this.orders.filter((o) => o.status === this.activeFilter);
  }

  setFilter(filter: 'ALL' | OrderStatus): void {
    this.activeFilter = filter;
  }

  onStatusChange(orderId: number, newStatus: OrderStatus): void {
    this.selectedStatuses[orderId] = newStatus;
  }

  updateStatus(order: Order): void {
    const targetStatus = this.selectedStatuses[order.id];
    if (!targetStatus || targetStatus === order.status) {
      return;
    }

    this.updatingOrderId = order.id;
    this.errorMessage = null;
    this.successMessage = null;

    this.ordersApi.updateOrderStatus(order.id, targetStatus).subscribe({
      next: (updated) => {
        this.updatingOrderId = null;
        this.orders = this.orders.map((o) => (o.id === updated.id ? updated : o));
        this.selectedStatuses[updated.id] = updated.status;
        this.successMessage = `Order #${updated.id} status successfully transitioned to ${updated.status}.`;
      },
      error: (err) => {
        this.updatingOrderId = null;
        this.errorMessage = err.error?.message || err.error?.detail || `Failed to update status for Order #${order.id}.`;
      }
    });
  }
}
