# DevSecOps Multi-Technology Proof-of-Concept Monorepo

Welcome to the **DevSecOps Proof-of-Concept (PoC) Monorepo**. This repository serves as a foundational platform designed to demonstrate a comprehensive, multi-stage DevSecOps lifecycle across a diverse polyglot microservice ecosystem.

The business functionality of each application is intentionally minimal (health checks and foundational UI placeholders), keeping the focus entirely on clean architecture, security automation, CI/CD integration, and progressive DevSecOps hardening.

---

## 🏛️ System Architecture

The intended future communication model connects frontends directly to domain microservices rather than a sequential chain:

```
[ Public Users ]                                [ Admin / Ops Users ]
       │                                                 │
       ▼                                                 ▼
┌──────────────┐                                 ┌────────────────┐
│   Next.js    │                                 │    Angular     │
│  (apps/web)  │                                 │(apps/dashboard)│
│  Port: 3000  │                                 │   Port: 4200   │
└──────┬───┬───┘                                 └───┬───┬────┬───┘
       │   │                                         │   │    │
       │   └─────────────────────────┐               │   │    │
       │                             ▼               │   │    │
       │                  ┌───────────────────────┐  │   │    │
       │                  │   Identity Service    │◄─┘   │    │
       │                  │(apps/identity-service)│      │    │
       │                  │     Django (8001)     │      │    │
       │                  └───────────────────────┘      │    │
       │                                                 │    │
       ▼                                                 │    │
┌───────────────────────┐                                │    │
│    Orders Service     │◄───────────────────────────────┘    │
│ (apps/orders-service) │                                     │
│   Spring Boot (8002)  │                                     │
└──────────┬────────────┘                                     │
           │                                                  │
           │      ┌───────────────────────┐                   │
           └─────►│ Notification Service  │◄──────────────────┘
                  │(apps/notification-srv)│
                  │     Express (8003)    │
                  └───────────────────────┘
```

*(Note: In Phase 1, the Identity Service APIs are implemented while remaining services operate with health probes. Cross-service integration will be established in Phase 2).*

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── web/                    # Public Web App (Next.js 14+)
│   ├── dashboard/              # Internal Admin Dashboard (Angular 18+)
│   ├── identity-service/       # Identity & Auth Service (Django 5.x)
│   ├── orders-service/         # Product & Orders Service (Spring Boot 3.x)
│   └── notification-service/   # Notification Service (Express 4.x)
│
├── infrastructure/
│   ├── docker/                 # Local & dev Docker configurations
│   ├── kubernetes/             # K8s manifests / Helm charts (Phase 8)
│   └── terraform/              # Cloud IaC modules (Phase 9)
│
├── security/
│   ├── policies/               # OPA, Kyverno, Semgrep security policies
│   ├── scripts/                # DevSecOps scanning & automation hooks
│   └── test-scenarios/         # DAST & security test suites (Phase 7)
│
├── docs/
│   ├── architecture/           # System design & service catalog
│   └── security/               # DevSecOps roadmap & security baselines
│
├── scripts/                    # Developer setup & maintenance scripts
├── .github/
│   └── workflows/              # CI/CD security pipelines (Phase 4-5)
│
├── docker-compose.yml          # Root multi-container orchestration
├── CONTRIBUTING.md             # Development & contribution guidelines
├── .editorconfig               # Cross-editor formatting standards
├── .gitignore                  # Global polyglot ignore patterns
└── README.md
```

---

## 🚀 Applications & Ports

| Application | Technology | Role | Port | Health Check |
|---|---|---|---|---|
| **`web`** | Next.js (Node 20+) | Public Client Landing & E-Commerce Portal | `3000` | `http://localhost:3000/api/health` |
| **`dashboard`** | Angular 18 (Nginx) | Internal Admin & Operations Dashboard | `4200` | `http://localhost:4200/health.json` |
| **`identity-service`** | Django 5 (Python 3.11+) | Identity, Authentication & RBAC | `8001` | `http://localhost:8001/health` |
| **`orders-service`** | Spring Boot 3 (Java 21) | Products, Inventory & Order Lifecycle | `8002` | `http://localhost:8002/health` |
| **`notification-service`** | Express.js (Node 20+) | Internal Alerts & Event Notifications | `8003` | `http://localhost:8003/health` |

---

## ⚡ Quickstart: Running Locally

### Option 1: Docker Compose (All Services)

To build and run all five applications simultaneously using containerized multi-stage builds:

```bash
docker compose up --build
```

To stop all services:
```bash
docker compose down
```

### Option 2: Running Applications Individually

Each application is completely decoupled and runnable natively:

#### 1. Next.js (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
# Open http://localhost:3000
```

#### 2. Angular (`apps/dashboard`)
```bash
cd apps/dashboard
npm install
npm start
# Open http://localhost:4200
```

#### 3. Django Identity Service (`apps/identity-service`)
```bash
cd apps/identity-service
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001
# Health: http://localhost:8001/health
```

#### 4. Spring Boot Orders Service (`apps/orders-service`)
```bash
cd apps/orders-service
# On Windows:
.\mvnw.cmd spring-boot:run
# On Linux/macOS:
./mvnw spring-boot:run
# Health: http://localhost:8002/health
```

#### 5. Express Notification Service (`apps/notification-service`)
```bash
cd apps/notification-service
npm install
npm start
# Health: http://localhost:8003/health
```

---

## 🛡️ DevSecOps Roadmap

This repository is designed to be progressively evolved across 10 distinct DevSecOps maturity phases:

1. **Phase 1: Monorepo Foundation & Scaffolding** *(Current)*
2. **Phase 2: Application Functionality & Service-to-Service Integration**
3. **Phase 3: Developer Security Controls (Pre-commit, Secret Detection, IDE Linting)**
4. **Phase 4: Pull Request Security Checks (SAST, SCA, Semgrep, Dependency Scans)**
5. **Phase 5: Build & Software Supply-Chain Security (SBOM generation, Cosign / SLSA provenance)**
6. **Phase 6: Container Security (Trivy, Grype, Minimal Distroless/Alpine baselines)**
7. **Phase 7: Staging Deployment & DAST (OWASP ZAP dynamic scanning)**
8. **Phase 8: Kubernetes Security (OPA/Gatekeeper, Kyverno, NetworkPolicies, CIS Benchmarks)**
9. **Phase 9: Terraform & Infrastructure-as-Code Security (Checkov, tfsec, Infracost)**
10. **Phase 10: Runtime Security & Observability (Falco, OpenTelemetry, Prometheus, Grafana)**

For detailed specifications, see [`docs/security/devsecops-roadmap.md`](docs/security/devsecops-roadmap.md).

---

## 📖 Further Documentation

- **[System Architecture & Data Flows](docs/architecture/system-overview.md)**
- **[Service Catalog & Responsibilities](docs/architecture/service-catalog.md)**
- **[Contributing Guide](CONTRIBUTING.md)**
