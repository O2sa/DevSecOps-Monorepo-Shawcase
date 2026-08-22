# Notification Service (`apps/notification-service`)

Internal notification, alert dispatch, and service-to-service communication microservice built with **Express.js** and Node.js 20+.

---

## 🎯 Purpose & Future Responsibilities

- **Internal Alerts**: System event notifications and administrative alert dispatches.
- **Service-to-Service Messaging**: Processing asynchronous events emitted by Identity and Orders services.
- **Email & Webhook Triggers**: User account verification emails, order confirmation receipts, and status change alerts.

*(Note: Notification delivery logic, webhooks, and event consumers are intentionally not implemented in Phase 1).*

---

## 🛠️ Tech Stack & Versioning

- **Framework**: Express.js 4.x
- **Runtime**: Node.js 20+
- **Security Middleware**: Helmet, CORS
- **Default Port**: `8003`

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
# Production mode
npm start

# Watch mode (Node 20+ native watch)
npm run dev
```
The service will be available at [http://localhost:8003](http://localhost:8003).

---

## 🩺 Health Check Endpoint

- **Endpoint**: `GET /health`
- **URL**: [http://localhost:8003/health](http://localhost:8003/health)
- **Response**:
```json
{
  "status": "UP",
  "service": "notification-service",
  "framework": "Express",
  "timestamp": "2026-08-22T04:40:00.000Z",
  "uptime": 14.56
}
```

---

## 🐳 Docker Usage

### Build Container
```bash
docker build -t devsecops-notification-service .
```

### Run Container
```bash
docker run -p 8003:8003 devsecops-notification-service
```
