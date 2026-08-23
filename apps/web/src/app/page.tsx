'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth/use-auth';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1>DevSecOps Web Portal</h1>
            <p className="subtitle">
              Public client application demonstrating multi-technology microservice integration and
              DevSecOps workflows.
            </p>
          </div>
          <span className="badge badge-success">
            <span className="status-dot"></span>
            Operational
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <span>
              Welcome back, <strong>{user.username}</strong> ({user.email || 'authenticated'})! You
              can browse products, manage orders, and check notifications.
            </span>
          </div>
        ) : null}

        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Frontend</div>
            <div className="info-value">Next.js 14 + React</div>
          </div>
          <div className="info-item">
            <div className="info-label">Identity Service</div>
            <div className="info-value">Django 5 (Port 8001)</div>
          </div>
          <div className="info-item">
            <div className="info-label">Orders Service</div>
            <div className="info-value">Spring Boot 3 (Port 8002)</div>
          </div>
          <div className="info-item">
            <div className="info-label">Notification Service</div>
            <div className="info-value">Express + TS (Port 8003)</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link href="/products" className="btn btn-primary">
            🛍️ Browse Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/orders" className="btn btn-outline">
                📦 My Orders
              </Link>
              <Link href="/notifications" className="btn btn-outline">
                🔔 Notifications
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                🔐 Log In
              </Link>
              <Link href="/register" className="btn btn-success">
                📝 Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>🏛️ Architecture & Endpoints</h2>
        <p className="subtitle">
          All client operations call backend microservices using standardized REST interfaces and
          stateless Bearer JWTs:
        </p>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Role</th>
                <th>Authentication</th>
                <th>Direct Endpoints</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Identity Service</strong>
                </td>
                <td>User Registration & Login</td>
                <td>Public</td>
                <td>
                  <code>/api/auth/register</code>, <code>/api/auth/login</code>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Orders Service</strong>
                </td>
                <td>Products & Orders</td>
                <td>Bearer JWT</td>
                <td>
                  <code>/api/products</code>, <code>/api/orders</code>, <code>/api/orders/me</code>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Notification Service</strong>
                </td>
                <td>Alerts & Notifications</td>
                <td>Bearer JWT</td>
                <td>
                  <code>/api/notifications</code>, <code>/api/notifications/:id/read</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
