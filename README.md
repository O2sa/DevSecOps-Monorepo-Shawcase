# DevSecOps Multi-Technology Showcase Monorepo

Welcome to the **DevSecOps Showcase Monorepo**. This repository demonstrates a complete, production-minded polyglot microservice ecosystem orchestrated with Docker Compose, featuring five interconnected applications, stateless JWT authentication, role-based access control, cross-origin communication, resilient service-to-service event dispatching, and Shift-Left DevSecOps Security Gates.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Host / Browser Environment
        Browser["User / Admin Web Browser"]
    end

    subgraph Docker Network: devsecops-network
        Web["Web Portal<br/>(Next.js 14 / pnpm - Port 3000)"]
        Dashboard["Admin Dashboard<br/>(Angular 18 / pnpm / Nginx - Port 4200:8080)"]
        Identity["Identity Service<br/>(Django 5 - Port 8001)"]
        Orders["Orders Service<br/>(Spring Boot 3 / Maven - Port 8002)"]
        Notify["Notification Service<br/>(Express + TypeScript / pnpm - Port 8003)"]
        Volume[("Persistent Storage<br/>identity-data volume")]
    end

    %% Browser direct access via mapped host ports
    Browser -->|"Public Storefront (Port 3000)"| Web
    Browser -->|"Operations Console (Port 4200)"| Dashboard
    Browser -->|"Direct Client API (CORS)"| Identity
    Browser -->|"Direct Client API (CORS)"| Orders
    Browser -->|"Direct Client API (CORS)"| Notify

    %% Service-to-service internal Docker communication
    Orders -->|"Internal Events (/internal/notifications)"| Notify
    Identity -.->|"Stores SQLite db.sqlite3"| Volume
```

---

## 📦 Applications & Port Matrix

| Service                    | Application Directory       | Technology Stack & Package Manager         | Container Port | Host Port | Health Check Endpoint               |
| -------------------------- | --------------------------- | ------------------------------------------ | -------------- | --------- | ----------------------------------- |
| **`web`**                  | `apps/web`                  | Next.js 14 / React 18 (**pnpm**)           | `3000`         | `3000`    | `http://localhost:3000/api/health`  |
| **`dashboard`**            | `apps/dashboard`            | Angular 18 (**pnpm** / Unprivileged Nginx) | `8080`         | `4200`    | `http://localhost:4200/health.json` |
| **`identity-service`**     | `apps/identity-service`     | Django 5 & Gunicorn (Python 3.11 / pip)    | `8001`         | `8001`    | `http://localhost:8001/health`      |
| **`orders-service`**       | `apps/orders-service`       | Spring Boot 3 (Java 21 JRE / Maven)        | `8002`         | `8002`    | `http://localhost:8002/health`      |
| **`notification-service`** | `apps/notification-service` | Express.js / TypeScript (**pnpm**)         | `8003`         | `8003`    | `http://localhost:8003/health`      |

---

## 🛡️ Complete DevSecOps Pipeline Flow

```mermaid
flowchart TD
    Dev["Developer"] -->|"git commit"| Gate1["1. Commit Gate (Husky, Prettier, ESLint, Secrets)"]
    Gate1 -->|"git push / PR"| Gate2["2. CI Gate (Tests, Build, Semgrep SAST, Trivy SCA)"]
    Gate2 -->|"Merge to main"| Gate3["3. Secure Build (Buildx, SBOM Syft, SLSA Provenance, Cosign Signing)"]
    Gate3 --> Gate4["4. Container Image Scan (Trivy OS, App Libs & Misconfig)"]
    Gate4 -->|"Passes Policy"| Gate5["5. Staging & DAST (Ephemeral Deploy, Smoke Tests, OWASP ZAP)"]
    Gate5 -->|"Passes DAST Policy"| Prod["🚀 Ready for Production Promotion"]
```

---

## 🛡️ Developer Security Workflow (Shift-Left Gate 1)

This repository enforces automated quality and security checks locally before code is committed to Git:

```
Developer
    ↓
git add <files>
    ↓
git commit -m "feat(identity): add token refresh"
    ↓
Git Hooks (Husky)
    ├── pre-commit: lint-staged
    │     ├── Prettier code formatting
    │     ├── ESLint & Python AST verification
    │     └── Staged Secret Scanner (scripts/scan-secrets.js)
    └── commit-msg: commitlint
          └── Conventional Commits verification
    ↓
Commit Accepted (or Blocked with actionable diagnostics)
```

### Developer Commands

| Command                      | Purpose                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `pnpm check`                 | Aggregates all local gates: format check, linting, and secret scan               |
| `pnpm format`                | Automatically formats all TypeScript, JavaScript, JSON, YAML, and Markdown files |
| `pnpm format:check`          | Verifies formatting compliance across the codebase without making changes        |
| `pnpm lint`                  | Runs ESLint and Python AST syntax validation                                     |
| `pnpm scan:secrets`          | Runs full-workspace secret scanning                                              |
| `pnpm scan:secrets --staged` | Scans only staged files (executed by `pre-commit` hook)                          |
| `pnpm smoke:test`            | Runs functional smoke tests against running services                             |
| `pnpm dast:evaluate`         | Evaluates structured OWASP ZAP DAST reports against security policy gate         |

---

## 🚀 CI / Pull Request Security Pipeline (Shift-Left Gate 2)

Automated security verification and regression testing run on every Pull Request and Push to `main` via GitHub Actions (`.github/workflows/ci.yml`):

- **Quality & Formatting**: Prettier format check and Next.js ESLint.
- **Secret Detection Scan**: Defense-in-depth Gitleaks v2 scanner checking git history and repository diffs.
- **Application Tests**: Automated Jest, Django (27 tests), and Spring Boot JUnit 5 (28 tests) execution.
- **Build Validation**: Typechecking and production bundle compilation for all applications.
- **SAST (Static Application Security Testing)**: Semgrep multi-language vulnerability analysis.
- **Dependency Security (SCA)**: Trivy filesystem vulnerability audit and automated daily Dependabot PRs.

---

## 🔐 Secure Build & Software Supply Chain (Shift-Left Gate 3)

Trusted builds on `main` and release tags (`v*.*.*`) execute the secure artifact packaging pipeline (`.github/workflows/secure-build.yml`):

```
Push to main / Release Tag
    ↓
Docker Buildx (Multi-Image Build from Source)
    ↓
Publish to GitHub Container Registry (GHCR)
    ↓
Extract Immutable Image Digest (@sha256:...)
    ├── 1. Generate SPDX SBOM via Syft (anchore/sbom-action)
    ├── 2. Attest SBOM to GHCR Image (actions/attest-sbom)
    ├── 3. Attest SLSA Build Provenance (actions/attest-build-provenance)
    └── 4. Keyless Image Signing with Sigstore Cosign (OIDC Token)
```

### 1. Published Container Images

| Application          | Container Registry URI                                  |
| -------------------- | ------------------------------------------------------- |
| Identity Service     | `ghcr.io/<owner>/devsecops-identity-service:latest`     |
| Orders Service       | `ghcr.io/<owner>/devsecops-orders-service:latest`       |
| Notification Service | `ghcr.io/<owner>/devsecops-notification-service:latest` |
| Web Portal           | `ghcr.io/<owner>/devsecops-web:latest`                  |
| Admin Dashboard      | `ghcr.io/<owner>/devsecops-dashboard:latest`            |

### 2. Verifying Image Signatures with Cosign

Verify signatures on published container images using Sigstore Cosign (keyless OIDC). The staging workflow enforces this check against exact immutable image digests (`@sha256:...`) before deploying:

```bash
# Verify by exact immutable image digest
cosign verify \
  --certificate-identity-regexp "https://github.com/O2sa/DevSecOps-Monorepo-Shawcase/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/o2sa/devsecops-identity-service@sha256:<digest>
```

---

## 🛡️ Container Security & Image Vulnerability Scanning (Shift-Left Gate 4)

Scans the **actual built container images** for OS vulnerabilities (Debian/Alpine packages), embedded application dependencies, base image vulnerabilities, and Dockerfile misconfigurations before artifacts are considered trusted.

- **`CRITICAL`**: **Blocks the build pipeline** (`exit-code: '1'`). Halts image attestation and signing.
- **`HIGH`**: Evaluated against [.trivyignore](file:///c:/Users/msii/Documents/devsecops_monorepo/.trivyignore). Unexempted issues are reported in SARIF.
- **`MEDIUM` / `LOW`**: Cataloged in GitHub Code Scanning (SARIF) and GitHub Actions Step Summaries.

---

## 🌐 Staging Deployment & Dynamic Application Security Testing (Shift-Left Gate 5)

Deploys the trusted container images into an isolated, ephemeral staging environment using exact immutable image digests and performs automated security testing against the **running applications and REST APIs** (`.github/workflows/staging-dast.yml`):

```
Secure Build Image Digest Artifacts
    ↓
Resolve Exact Immutable Image Digests (@sha256:...)
    ↓
Pre-Deployment Verification (cosign verify - strictly blocks on failure)
    ↓
Deploy Ephemeral Staging (docker-compose.staging.yml with immutable digests)
    ↓
Wait for Application Readiness (Microservice Health Probes)
    ↓
Functional Smoke Tests (scripts/smoke-tests.js)
    ↓
Dynamic Application Security Testing (OWASP ZAP)
    ├── Web App Baseline Scan (Next.js :3000)
    ├── Admin Dashboard Scan (Angular :4200)
    ├── Identity Service REST API Scan (:8001/api/auth/login)
    ├── Orders Service REST API Scan (:8002/api/products)
    └── Notification Service REST API Scan (:8003/api/notifications)
    ↓
Upload All Isolated DAST Reports (dast-reports/*)
    ↓
DAST Security Policy Gate (scripts/evaluate-dast-policy.js - blocks on High/Critical)
    ↓
Teardown Staging Environment (docker compose down -v)
```

### Running Staging & DAST Locally

1. **Launch Staging Stack**:

   ```bash
   docker compose -f docker-compose.staging.yml up -d
   ```

2. **Verify Service Health & Smoke Tests**:

   ```bash
   pnpm smoke:test
   ```

3. **Run Local OWASP ZAP Baseline Scan (Docker)**:

   ```bash
   docker run --rm -t --net="host" zaproxy/zap-stable zap-baseline.py \
     -t http://localhost:3000 -r zap-report.html
   ```

4. **Evaluate DAST Reports Against Security Policy**:

   ```bash
   pnpm dast:evaluate
   ```

5. **Teardown Staging Environment**:
   ```bash
   docker compose -f docker-compose.staging.yml down -v
   ```

---

## 🐳 Running the Stack with Docker Compose

### 1. Clone & Configure Environment

No pre-built host artifacts are required. The entire stack builds deterministically inside Docker from source:

```bash
git clone <repository>
cd DevSecOps-Monorepo-Shawcase
cp .env.example .env
```

### 2. Build & Launch Stack

```bash
docker compose up --build -d
```

### 3. Verify Container Health

```bash
docker compose ps
```

All 5 services should report `Up (healthy)`.
