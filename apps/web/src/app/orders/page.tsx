'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ordersApi } from '../../lib/api/orders';
import { Order } from '../../types/order';
import { Alert } from '../../components/Alert';

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to retrieve your orders from the Orders Service.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED') {
      return <span className="badge badge-completed">✓ Completed</span>;
    }
    if (s === 'PROCESSING') {
      return <span className="badge badge-processing">⚙️ Processing</span>;
    }
    return <span className="badge badge-pending">⏳ Pending</span>;
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1>My Orders</h1>
            <p className="subtitle">
              Your personal order history retrieved securely from the Spring Boot Orders Service.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              🔄 Refresh Orders
            </button>
            <Link href="/products" className="btn btn-primary btn-sm">
              + New Order
            </Link>
          </div>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            title="Orders Error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No Orders Found</h3>
            <p className="subtitle">You have not placed any orders yet.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Browse Products to Place an Order
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const price = order.product?.price ? Number(order.product.price) : 0;
                  const total = price * order.quantity;
                  const formattedDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : 'N/A';

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>{order.product?.name || 'Unknown Item'}</td>
                      <td>${price.toFixed(2)}</td>
                      <td>{order.quantity}</td>
                      <td>
                        <strong style={{ color: 'var(--accent-cyan)' }}>${total.toFixed(2)}</strong>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
