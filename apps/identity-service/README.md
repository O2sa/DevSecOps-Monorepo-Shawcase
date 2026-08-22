# Identity Service (`apps/identity-service`)

Core identity, user registration, authentication (JWT), and authorization microservice built with **Django 5** and **Django REST Framework**.

---

## 🎯 1. Service Purpose

The **Identity Service** is the central authentication and authorization authority for the DevSecOps platform. It manages user accounts, securely hashes credentials, issues cryptographic JSON Web Tokens (JWTs), evaluates role-based access permissions, and exposes profile introspection endpoints for downstream services.

---

## 🏛️ 2. Architecture Overview

```
                 [ Client / Frontend Apps ]
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      POST /api/auth/register     POST /api/auth/login
              │                           │
              ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │ User Registration │       │ JWT Issuance      │
    │ (PBKDF2 Hashing)  │       │ (Access + Refresh)│
    └───────────────────┘       └───────────────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │ Protected APIs    │
                                │ (Bearer JWT Auth) │
                                └─────────┬─────────┘
                                          │
              ┌───────────────────────────┴───────────────────────────┐
              ▼                                                       ▼
      GET /api/users/me                                       GET /api/users
      (Role: user / admin)                                    (Role: admin only)
```

---

## 📋 3. Requirements

- Python 3.11+
- Virtual environment (`venv`)
- Dependencies specified in `requirements.txt`:
  - `Django>=5.0,<5.2`
  - `djangorestframework>=3.15.0,<3.16.0`
  - `djangorestframework-simplejwt>=5.3.0,<5.4.0`
  - `gunicorn>=22.0.0,<24.0.0`

---

## ⚙️ 4. Environment Configuration

Copy `.env.example` to `.env` (or configure system environment variables):

```bash
cp .env.example .env
```

| Variable | Default | Required in Production (`DJANGO_DEBUG=False`) | Description |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | *(dev fallback)* | **Yes (Fails fast if missing)** | Cryptographic key for session & token signing |
| `DJANGO_DEBUG` | `True` | No (Defaults to `True` for local dev) | Enable/disable debug mode (`False` in production) |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,identity-service,0.0.0.0` | No | Comma-delimited list of valid host headers |
| `PORT` | `8001` | No | Service bind port |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `60` | No | JWT access token validity duration |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `7` | No | JWT refresh token validity duration |

---

## 🚀 5. Installation & Migrations

### 1. Create and Activate Virtual Environment
```bash
# On Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate

# On Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Migrations
```bash
python manage.py makemigrations users
python manage.py migrate
```

---

## 💻 6. How to Run Locally

### Development Server
```bash
python manage.py runserver 8001
```
The service will be live at [http://localhost:8001](http://localhost:8001).

### Production Server (Gunicorn)
```bash
DJANGO_DEBUG=False DJANGO_SECRET_KEY="your-production-secret" gunicorn --bind 0.0.0.0:8001 --workers 2 --threads 4 config.wsgi:application
```

---

## 🧪 7. How to Run Tests

Run the complete automated test suite (Registration, Authentication, Authorization, Health):

```bash
python manage.py test users.tests
```

---

## 📖 8. API Endpoint Documentation

| Method | Endpoint | Authentication | Required Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | Public | Register a new user account |
| `POST` | `/api/auth/login` | No | Public | Authenticate credentials & issue JWT tokens |
| `POST` | `/api/auth/refresh` | No | Public | Exchange refresh token for new access token |
| `GET` | `/api/users/me` | Yes (`Bearer <token>`) | `user` / `admin` | Retrieve current authenticated user profile |
| `GET` | `/api/users` | Yes (`Bearer <token>`) | `admin` | List all registered users (Admin only) |
| `GET` | `/health` | No | Public | Lightweight service health probe |

---

## 💡 9. Example Requests & Responses

### 1. Register User (`POST /api/auth/register`)
**Request**:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```
**Response (`201 Created`)**:
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "role": "user"
}
```

---

### 2. User Login (`POST /api/auth/login`)
**Request**:
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "SecurePassword123!"
  }'
```
**Response (`200 OK`)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Refresh Token (`POST /api/auth/refresh`)
**Request**:
```bash
curl -X POST http://localhost:8001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "<your-refresh-token>"
  }'
```
**Response (`200 OK`)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Current User (`GET /api/users/me`)
**Request**:
```bash
curl -X GET http://localhost:8001/api/users/me \
  -H "Authorization: Bearer <your-access-token>"
```
**Response (`200 OK`)**:
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "role": "user"
}
```

---

### 5. Admin: List Users (`GET /api/users`)
**Request**:
```bash
curl -X GET http://localhost:8001/api/users \
  -H "Authorization: Bearer <admin-access-token>"
```
**Response (`200 OK`)**:
```json
{
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    {
      "id": 2,
      "username": "john",
      "email": "john@example.com",
      "role": "user"
    }
  ]
}
```

---

### 6. Health Check (`GET /health`)
**Request**:
```bash
curl http://localhost:8001/health
```
**Response (`200 OK`)**:
```json
{
  "status": "ok"
}
```

---

## 🔮 10. Future Responsibilities

- **OAuth2 & Social Logins**: Social authentication providers (Google, GitHub).
- **MFA (Multi-Factor Authentication)**: TOTP / Authenticator app support.
- **Password Reset & Email Verification**: Secure token-based verification workflows.
- **Service-to-Service mTLS / API Keys**: Machine authentication between microservices.
