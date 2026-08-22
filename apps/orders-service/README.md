# Orders Service (`apps/orders-service`)

Products catalog, order placement, and order status management microservice built with **Spring Boot 3** and **Java 21**, integrating with the Django Identity Service for stateless JWT authentication and role authorization.

---

## 🎯 1. Service Purpose

The **Orders Service** manages product catalog data and the lifecycle of customer orders. It enforces server-side access controls, ensuring authenticated users can only manage their own orders while granting administrators full control over system-wide orders and status transitions.

---

## 📋 2. Responsibilities

- **Product Catalog**: Expose public endpoints to list and query product details.
- **Order Placement**: Allow authenticated users to place orders for existing products.
- **Order Isolation**: Ensure users can only retrieve orders matching their own authenticated user ID.
- **Admin Order Management**: Provide administrator-only endpoints to inspect all orders and transition statuses (`PENDING` &rarr; `PROCESSING` &rarr; `COMPLETED`).
- **Stateless Identity Integration**: Verify HMAC-SHA256 JWT tokens issued by the Django Identity Service.

---

## 🛠️ 3. Technology Stack

- **Framework**: Spring Boot 3.3.x
- **Runtime**: Java 21 LTS (Oracle / Eclipse Temurin)
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: In-Memory H2 Database (PostgreSQL compatibility mode)
- **Security**: Spring Security & JJWT (`io.jsonwebtoken:0.12.6`)
- **Build Tool**: Apache Maven 3.9+ (Maven Wrapper included)
- **Default Port**: `8002`

---

## 🏛️ 4. Architecture Overview

```
                      [ Client / Frontends ]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       GET /api/products               POST /api/orders
       (Public Catalog)                (Bearer JWT Required)
                 │                               │
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │ Product Entity    │           │ JwtAuthFilter     │
       │ (H2 In-Memory DB) │           │ (Claims: user_id, │
       └───────────────────┘           │  role, is_admin)  │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                       ┌───────────────────┐
                                       │ Order Entity      │
                                       │ (userId, Product, │
                                       │  quantity, status)│
                                       └─────────┬─────────┘
                                                 │
                 ┌───────────────────────────────┴───────────────────────────────┐
                 ▼                                                               ▼
         GET /api/orders/me                                              GET /api/orders
         (Filtered by userId)                                            PATCH /api/orders/{id}/status
                                                                         (ROLE_ADMIN Required)
```

---

## 🔗 5. Relationship with the Identity Service

The Orders Service does **not** store or manage user accounts, passwords, or authentication credentials.

Instead:
1. Users register and log in via the **Django Identity Service** (`POST /api/auth/login` on port `8001`).
2. The Identity Service issues an HMAC-SHA256 signed JWT containing custom claims: `user_id`, `username`, `email`, `role`, and `is_admin`.
3. The client passes this token to the Orders Service via `Authorization: Bearer <token>`.
4. The Orders Service verifies the cryptographic signature locally using the shared secret (`orders.jwt.secret` / `DJANGO_SECRET_KEY`) and extracts the authenticated identity statelessly.

---

## 🔐 6. JWT Authentication & Role Mapping

- **Signing Algorithm**: `HS256` (HMAC-SHA256).
- **Signing Secret**: Configured via `orders.jwt.secret` (environment variable `DJANGO_SECRET_KEY`).
- **Claim Extraction**:
  - `user_id`: Mapped to `UserPrincipal.getUserId()` and attached to created orders.
  - `role`: Mapped to Spring Security authority `ROLE_USER` (`role="user"`) or `ROLE_ADMIN` (`role="admin"`).
  - `is_admin`: If `true`, grants `ROLE_ADMIN`.

---

## 🗄️ 7. Database Model

### Product Entity (`products` table)
- `id` (`Long`, Primary Key)
- `name` (`VARCHAR(255)`, Not Null)
- `price` (`DECIMAL(10, 2)`, Not Null)

### Order Entity (`orders` table)
- `id` (`Long`, Primary Key)
- `user_id` (`Long`, Not Null)
- `product_id` (`Long`, Foreign Key to `products`, Not Null)
- `quantity` (`INTEGER`, Not Null, > 0)
- `status` (`VARCHAR(20)`, Enum: `PENDING`, `PROCESSING`, `COMPLETED`)
- `created_at` (`TIMESTAMP`, Auto-generated)
- `updated_at` (`TIMESTAMP`, Auto-generated)

---

## 📦 8. Demo Data

Upon application startup, `DataInitializer` automatically populates the product catalog with 3 demo products:

| ID | Product Name | Price |
|---|---|---|
| `1` | Demo Product A | $10.00 |
| `2` | Demo Product B | $20.00 |
| `3` | Demo Product C | $30.00 |

---

## 🚀 9. How to Run Locally

### Prerequisites
- Java 21 JDK installed (`JAVA_HOME` configured).

### Start the Service
```bash
cd apps/orders-service

# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```
The service will be available at [http://localhost:8002](http://localhost:8002).

---

## 🧪 10. How to Run Tests

Run the full automated test suite:

```bash
cd apps/orders-service

# On Windows:
.\mvnw.cmd test

# On Linux / macOS:
./mvnw test
```

---

## 📖 11. API Endpoint Documentation

| Method | Endpoint | Authentication | Required Role | Status Code | Description |
|---|---|---|---|---|---|
| `GET` | `/health` | No | Public | `200 OK` | Service health probe (`{"status": "ok"}`) |
| `GET` | `/api/products` | No | Public | `200 OK` | List all available demo products |
| `GET` | `/api/products/{id}` | No | Public | `200 OK` / `404` | Get single product by ID |
| `POST` | `/api/orders` | Yes (`Bearer <token>`) | `user` / `admin` | `201 Created` | Create new order for authenticated user |
| `GET` | `/api/orders/me` | Yes (`Bearer <token>`) | `user` / `admin` | `200 OK` | Retrieve current authenticated user's orders |
| `GET` | `/api/orders` | Yes (`Bearer <token>`) | `admin` | `200 OK` | Retrieve all orders across system |
| `PATCH` | `/api/orders/{id}/status` | Yes (`Bearer <token>`) | `admin` | `200 OK` / `404` | Update order status (`PENDING`, `PROCESSING`, `COMPLETED`) |

---

## 💡 12. Example Requests & Responses

### 1. List Products (`GET /api/products`)
```bash
curl http://localhost:8002/api/products
```
**Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "name": "Demo Product A",
    "price": 10.00
  },
  {
    "id": 2,
    "name": "Demo Product B",
    "price": 20.00
  },
  {
    "id": 3,
    "name": "Demo Product C",
    "price": 30.00
  }
]
```

---

### 2. Create Order (`POST /api/orders`)
```bash
curl -X POST http://localhost:8002/api/orders \
  -H "Authorization: Bearer <user-jwt-access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```
**Response (`201 Created`)**:
```json
{
  "id": 1,
  "userId": 5,
  "product": {
    "id": 1,
    "name": "Demo Product A",
    "price": 10.00
  },
  "quantity": 2,
  "status": "PENDING",
  "createdAt": "2026-08-22T05:00:00Z"
}
```

---

### 3. Get My Orders (`GET /api/orders/me`)
```bash
curl -X GET http://localhost:8002/api/orders/me \
  -H "Authorization: Bearer <user-jwt-access-token>"
```
**Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "product": {
      "id": 1,
      "name": "Demo Product A",
      "price": 10.00
    },
    "quantity": 2,
    "status": "PENDING",
    "createdAt": "2026-08-22T05:00:00Z"
  }
]
```

---

### 4. Admin: Get All Orders (`GET /api/orders`)
```bash
curl -X GET http://localhost:8002/api/orders \
  -H "Authorization: Bearer <admin-jwt-access-token>"
```
**Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "userId": 5,
    "product": {
      "id": 1,
      "name": "Demo Product A",
      "price": 10.00
    },
    "quantity": 2,
    "status": "PENDING",
    "createdAt": "2026-08-22T05:00:00Z"
  }
]
```

---

### 5. Admin: Update Order Status (`PATCH /api/orders/{id}/status`)
```bash
curl -X PATCH http://localhost:8002/api/orders/1/status \
  -H "Authorization: Bearer <admin-jwt-access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSING"
  }'
```
**Response (`200 OK`)**:
```json
{
  "id": 1,
  "userId": 5,
  "product": {
    "id": 1,
    "name": "Demo Product A",
    "price": 10.00
  },
  "quantity": 2,
  "status": "PROCESSING",
  "createdAt": "2026-08-22T05:00:00Z"
}
```

---

### 6. Health Check (`GET /health`)
```bash
curl http://localhost:8002/health
```
**Response (`200 OK`)**:
```json
{
  "status": "ok"
}
```

---

## 🔮 13. Current Limitations & Future Improvements

- **Asynchronous Event Emitting**: Emitting order lifecycle events (`ORDER_CREATED`, `ORDER_STATUS_CHANGED`) to the Express Notification Service will be wired in Phase 2.
- **Asymmetric Key Cryptography (RS256 / JWKS)**: Future security hardening can evolve the shared HMAC secret into an asymmetric public/private key or JWKS endpoint hosted by the Identity Service.
- **Production PostgreSQL Migration**: Database configuration is decoupled and ready for managed PostgreSQL migration via environment variables.
