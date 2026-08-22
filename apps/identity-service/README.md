# Identity Service (`apps/identity-service`)

Core identity, user management, and authentication microservice built with **Django 5** and Python 3.11+.

---

## 🎯 Purpose & Future Responsibilities

- **User Accounts**: Registration, profile lifecycle, and account credential management.
- **Authentication**: JWT issuance, validation, and session revocation.
- **Role-Based Access Control (RBAC)**: Fine-grained permission evaluations for Admin and Client scopes.
- **Token Introspection**: Serving token verification endpoints for downstream services (Orders, Notifications).

*(Note: Business APIs and auth flows are intentionally not implemented in Phase 1).*

---

## 🛠️ Tech Stack & Versioning

- **Framework**: Django 5.x
- **Language**: Python 3.11+
- **WSGI Server**: Gunicorn 22+
- **Default Port**: `8001`

---

## 🚀 Running Locally

### 1. Create and Activate Virtual Environment
```bash
python -m venv .venv

# On Linux / macOS:
source .venv/bin/activate

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
python manage.py runserver 8001
```
The service will be available at [http://localhost:8001](http://localhost:8001).

---

## 🩺 Health Check Endpoint

- **Endpoint**: `GET /health/`
- **URL**: [http://localhost:8001/health/](http://localhost:8001/health/)
- **Response**:
```json
{
  "status": "UP",
  "service": "identity-service",
  "framework": "Django 5",
  "timestamp": "2026-08-22T04:40:00.000000+00:00"
}
```

---

## 🐳 Docker Usage

### Build Container
```bash
docker build -t devsecops-identity-service .
```

### Run Container
```bash
docker run -p 8001:8001 devsecops-identity-service
```
