'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/use-auth';
import { ordersApi } from '../../lib/api/orders';
import { Product } from '../../types/product';
import { Alert } from '../../components/Alert';
import { ApiError } from '../../lib/api/client';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderingProductId, setOrderingProductId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await ordersApi.getProducts();
      setProducts(data);
      const initialQuantities: Record<number, number> = {};
      data.forEach((p) => {
        initialQuantities[p.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Unable to load products. Please verify the Orders Service is running on port 8002.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, qty),
    }));
  };

  const handleOrder = async (product: Product) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!isAuthenticated) {
      router.push('/login?redirect=/products');
      return;
    }

    const quantity = quantities[product.id] || 1;
    setOrderingProductId(product.id);

    try {
      const createdOrder = await ordersApi.createOrder({
        productId: product.id,
        quantity,
      });

      setSuccessMessage(
        `Order #${createdOrder.id} successfully created for ${product.name} (Qty: ${quantity}, Status: ${createdOrder.status})!`
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message || 'Failed to place order.');
      }
    } finally {
      setOrderingProductId(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1>Product Catalog</h1>
            <p className="subtitle">
              Browse available items served directly from the Spring Boot Orders Service.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchProducts}
            disabled={isLoading}
          >
            🔄 Refresh Catalog
          </button>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            title="Catalog Error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            title="Order Confirmed"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching product catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Products Available</h3>
            <p className="subtitle">The Orders Service has not seeded any products yet.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    ITEM #{product.id}
                  </div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">${Number(product.price).toFixed(2)}</div>
                </div>

                <div className="order-action-row">
                  <select
                    className="quantity-select"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value, 10))}
                    disabled={orderingProductId === product.id}
                    aria-label={`Select quantity for ${product.name}`}
                  >
                    {[1, 2, 3, 4, 5, 10].map((num) => (
                      <option key={num} value={num}>
                        Qty: {num}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleOrder(product)}
                    disabled={orderingProductId === product.id}
                  >
                    {orderingProductId === product.id
                      ? 'Ordering...'
                      : isAuthenticated
                        ? 'Place Order'
                        : 'Log in to Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <Link
            href="/orders"
            style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}
          >
            View your order history &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
