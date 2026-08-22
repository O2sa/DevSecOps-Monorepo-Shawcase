# Service Catalog & Responsibilities

This catalog documents the five applications scaffolded in the DevSecOps Proof-of-Concept monorepo.

---

## 1. Next.js Public Web Application (`apps/web`)

- **Role**: Public-facing client web portal.
- **Port**: `3000`
- **Framework**: Next.js 14 (App Router) / React 18 / TypeScript
- **Runtime**: Node.js 20+
- **Future Responsibilities**:
  - Public landing page and marketing overview.
  - Product catalog browsing and search interface.
  - User authentication UI (login, register, forgot password).
  - Customer account management and personal order history.
- **Upstream / Inbound**: End users (Web Browsers, Mobile Web).
- **Downstream / Outbound**: Identity Service (`http://identity-service:8001`), Orders Service (`http://orders-service:8002`).

---

## 2. Angular Admin Dashboard (`apps/dashboard`)

- **Role**: Internal administration and operations portal.
- **Port**: `4200`
- **Framework**: Angular 18 (Standalone Components) / TypeScript
- **Web Server**: Unprivileged Nginx on Alpine Linux
- **Future Responsibilities**:
  - Secure internal dashboard for operators and administrators.
  - User and role management interface (assigning permissions, locking accounts).
  - Order status tracking, order updates, and inventory management.
  - Notification log viewing and manual alert dispatching.
- **Upstream / Inbound**: Internal administrators and operators.
- **Downstream / Outbound**: Identity Service (`http://identity-service:8001`), Orders Service (`http://orders-service:8002`), Notification Service (`http://notification-service:8003`).

---

## 3. Django Identity Service (`apps/identity-service`)

- **Role**: Identity provider, user directory, and authorization authority.
- **Port**: `8001`
- **Framework**: Django 5.x / Python 3.11+ / Gunicorn
- **Future Responsibilities**:
  - User registration and credential storage (secure password hashing).
  - Authentication and token lifecycle (JWT generation, signing, refresh).
  - Role-Based Access Control (RBAC) definition and permission verification.
  - Token introspection endpoint for backend microservices.
- **Upstream / Inbound**: Next.js Web App, Angular Dashboard, Orders Service.
- **Downstream / Outbound**: Notification Service (`http://notification-service:8003`) for security-related alerts.

---

## 4. Spring Boot Orders Service (`apps/orders-service`)

- **Role**: Order processing, lifecycle state machine, and product catalog management.
- **Port**: `8002`
- **Framework**: Spring Boot 3.3.x / Java 21 / Maven
- **Future Responsibilities**:
  - Product catalog CRUD and real-time inventory level management.
  - Order creation, price calculation, validation, and persistence.
  - Order status state transitions (`CREATED`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`).
  - Emitting order lifecycle events to downstream listeners.
- **Upstream / Inbound**: Next.js Web App, Angular Dashboard.
- **Downstream / Outbound**: Identity Service (`http://identity-service:8001` for token validation), Notification Service (`http://notification-service:8003` for event dispatch).

---

## 5. Express Notification Service (`apps/notification-service`)

- **Role**: Internal notifications, alerts, and asynchronous message handler.
- **Port**: `8003`
- **Framework**: Express.js 4.x / Node.js 20+
- **Future Responsibilities**:
  - Ingestion of internal alert payloads from other services.
  - Dispatching notifications (email notifications, in-app alerts, webhooks).
  - Service-to-service communication hub for event dispatches.
- **Upstream / Inbound**: Identity Service, Orders Service, Angular Dashboard.
- **Downstream / Outbound**: External mail delivery providers / webhook endpoints.
