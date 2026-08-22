# Public Web Application (`apps/web`)

Client-facing landing and e-commerce portal built with **Next.js 14** (App Router) and React 18.

---

## 🎯 Purpose & Future Responsibilities

- **Public Landing Page**: Entry point for end users.
- **Product Catalog Browsing**: View available items and inventory from Orders Service.
- **User Authentication UI**: Login, registration, and session token management via Identity Service.
- **Customer Account Portal**: Order history and profile management.

*(Note: Business functionality is intentionally not implemented in Phase 1).*

---

## 🛠️ Tech Stack & Versioning

- **Framework**: Next.js 14.x (App Router)
- **UI Library**: React 18.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🩺 Health Check Endpoint

- **Endpoint**: `GET /api/health`
- **URL**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Response**:
```json
{
  "status": "UP",
  "service": "web",
  "framework": "Next.js",
  "timestamp": "2026-08-22T04:40:00.000Z",
  "uptime": 12.34
}
```

---

## 🐳 Docker Usage

### Build Container
```bash
docker build -t devsecops-web .
```

### Run Container
```bash
docker run -p 3000:3000 devsecops-web
```
