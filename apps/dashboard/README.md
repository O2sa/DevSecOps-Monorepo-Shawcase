# DevSecOps Admin Dashboard (`apps/dashboard`)

Internal administrative and operational control plane built with **Angular 18**, **TypeScript**, **Angular Router**, and **Angular HttpClient**, designed to consume and manage the microservices across the DevSecOps monorepo.

---

## 🎯 1. Application Purpose

The **Admin Dashboard** is an internal operations portal for platform administrators. It provides:

- **Operational Metrics**: Real-time aggregation of orders, gross revenue, inventory, and registered accounts.
- **Order Lifecycle Management**: Administrative inspection of all customer orders across users with interactive lifecycle status transitions (`PENDING` &rarr; `PROCESSING` &rarr; `COMPLETED`).
- **Product Catalog Inspection**: Product catalog viewer connecting to the Spring Boot Orders Service.
- **User Directory & RBAC Audit**: User account directory and role auditing powered by the Django Identity Service.

> [!NOTE]
> The Angular Admin Dashboard is a client application. Real authentication and authorization are enforced server-side by the backend microservices. Frontend route guards provide navigation control and user feedback.

---

## 🏛️ 2. Architecture Overview

```
                           ┌───────────────────────────┐
                           │      Admin Dashboard      │
                           │      Angular 18 (SPA)     │
                           │   (http://localhost:4200) │
                           └─────────────┬─────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │ (JWT Auth)            │ (JWT Auth)            │
                 ▼                       ▼                       ▼
     ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
     │   Identity Service    │ │    Orders Service     │ │ Notification Service  │
     │   Django (Port 8001)  │ │ Spring Boot (Port 8002│ │   Express (Port 8003) │
     │  - Admin Login / JWT  │ │  - Product Catalog    │ │  - User Notifications │
     │  - User Directory     │ │  - Order Mgmt & Status│ │                       │
     └───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

---

## 🛠️ 3. Technology Stack

- **Framework**: Angular 18 (Standalone Components, Functional Guards, Functional Interceptors, Signals)
- **Language**: TypeScript 5.4+
- **HTTP Client**: `@angular/common/http` with `provideHttpClient(withInterceptors([authInterceptor]))`
- **Routing**: `@angular/router` with `provideRouter(routes)` and `adminGuard`
- **Styles**: Vanilla CSS Design System with CSS variables and responsive dark-mode theme
- **Build Tool**: Angular CLI / Application Builder (`@angular-devkit/build-angular:application`)
- **Default Port**: `4200`

---

## 🔐 4. Authentication, Roles & Token Handling

### Authentication Flow

1. Administrator enters credentials on `/login`.
2. `IdentityApiService.login()` calls `POST http://localhost:8001/api/auth/login`.
3. The Identity Service issues an HMAC-SHA256 JWT containing claims: `user_id`, `username`, `email`, `role`, and `is_admin`.
4. `AuthStorageService` stores the access token in an isolated storage abstraction (`localStorage` with in-memory fallback).
5. `AuthService` decodes the token payload and verifies that `role === 'admin'` or `is_admin === true`.
6. Non-admin users are rejected with an access-denied message and immediately signed out.
7. Authorized administrators are redirected to `/dashboard`.

### HTTP Interceptor (`authInterceptor`)

- Automatically intercepts outgoing requests matching configured backend service URLs (`http://localhost:8001`, `http://localhost:8002`, `http://localhost:8003`).
- Injects `Authorization: Bearer <token>`.
- Does **not** attach authentication tokens to third-party or external domains.
- Automatically handles `401 Unauthorized` responses by clearing authentication state and redirecting to `/login`.

### Route Guard (`adminGuard`)

- Protects all administrative routes (`/dashboard`, `/orders`, `/products`, `/users`).
- Redirects unauthenticated users to `/login?returnUrl=...`.
- Redirects non-admin authenticated users to `/login?error=forbidden`.

---

## 📄 5. Implemented Routes & Features

| Route        | Component            | Access     | Description                                                                   |
| ------------ | -------------------- | ---------- | ----------------------------------------------------------------------------- |
| `/login`     | `LoginComponent`     | Public     | Administrator login form with role validation and error display               |
| `/dashboard` | `DashboardComponent` | Admin Only | Operational metrics (Orders, Revenue, Status Breakdown, Users, Recent Orders) |
| `/orders`    | `OrdersComponent`    | Admin Only | System-wide order table, status filtering, and interactive status updates     |
| `/products`  | `ProductsComponent`  | Admin Only | Product catalog inventory, unit prices, and order unit counts                 |
| `/users`     | `UsersComponent`     | Admin Only | User directory table with role badges and account permissions                 |

---

## 🔑 6. Default Administrator Account

A default superadmin account is initialized in the Django Identity Service:

- **Username**: `admin`
- **Email**: `admin@devsecops.local`
- **Password**: `AdminPassword123!`
- **Role**: `admin` (`is_staff=True`, `is_superuser=True`)

---

## ⚙️ 7. Environment Configuration

Backend microservice URLs are configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  identityServiceUrl: 'http://localhost:8001',
  ordersServiceUrl: 'http://localhost:8002',
  notificationServiceUrl: 'http://localhost:8003',
};
```

---

## 🚀 8. How to Run Locally

### Prerequisites

- Node.js 18+ (tested with Node.js 20/24)
- Backend services running on ports `8001`, `8002`, and `8003`

### Start Development Server

```bash
cd apps/dashboard
npm run dev
# or
npm start
```

The dashboard will be available at [http://localhost:4200](http://localhost:4200).

### Build Production Bundle

```bash
npm run build
```

The compiled production bundle is generated in `dist/devsecops-dashboard/browser/`.

---

## 🔮 9. Current Limitations & Deferred Features

- **Product Mutations**: Product creation (`POST`), editing (`PUT`), and deletion (`DELETE`) are read-only in the Orders Service. Product management is currently limited to inventory and pricing inspection.
- **Admin Notifications**: The Notification Service currently supports user-scoped notification retrieval. System-wide administrative notification broadcasting is reserved for Phase 2.
- **BFF / Cookie Architecture**: Token storage currently uses centralized browser storage. This will be upgraded to an HttpOnly cookie / BFF pattern during the security hardening phase.
