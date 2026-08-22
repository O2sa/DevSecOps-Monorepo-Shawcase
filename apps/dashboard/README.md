# Admin / Operations Dashboard (`apps/dashboard`)

Internal administration and operational dashboard built with **Angular 18** (Standalone Components).

---

## 🎯 Purpose & Future Responsibilities

- **Internal Admin Portal**: Restricted operations console.
- **User & Role Management**: Administrative interface to manage users, permissions, and audit logs via Identity Service.
- **Order & Product Administration**: Inventory controls and order dispatch views via Orders Service.
- **Notification & Alert Hub**: System-wide notifications and incident broadcast monitoring.

*(Note: Business functionality is intentionally not implemented in Phase 1).*

---

## 🛠️ Tech Stack & Versioning

- **Framework**: Angular 18.x
- **Architecture**: Standalone Components
- **Language**: TypeScript 5.x
- **Production Server**: Nginx (Unprivileged Alpine)

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```
The dashboard will be available at [http://localhost:4200](http://localhost:4200).

### 3. Production Build
```bash
npm run build
```

---

## 🩺 Health Check

- **Static Health Check**: [http://localhost:4200/health.json](http://localhost:4200/health.json)
- **Response**:
```json
{
  "status": "UP",
  "service": "dashboard",
  "framework": "Angular 18",
  "timestamp": "2026-08-22T04:40:00.000Z"
}
```

---

## 🐳 Docker Usage

### Build Container
```bash
docker build -t devsecops-dashboard .
```

### Run Container
```bash
# Container listens on port 8080 internally, mapped to host port 4200
docker run -p 4200:8080 devsecops-dashboard
```
