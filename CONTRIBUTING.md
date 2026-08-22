# Contributing to the DevSecOps PoC Monorepo

Thank you for contributing! This guide outlines development practices, conventions, and procedures to ensure high code quality and secure development across all monorepo components.

---

## 🧭 General Principles

1. **Polyglot Independence**: Each application in `apps/` must maintain self-contained build configurations, dependency specifications, and independent runnability.
2. **Shift-Left Security**: Security is integrated into every step of development. Never commit secrets, credentials, or insecure defaults.
3. **Decoupled Architecture**: Services communicate strictly via documented REST APIs or message contracts.

---

## 🌿 Branching and Git Conventions

### Branch Naming
- `feature/<ticket-or-name>`: New feature or capability
- `fix/<ticket-or-name>`: Bug fixes
- `sec/<cve-or-rule>`: Security vulnerability fixes or policy updates
- `infra/<description>`: Infrastructure as Code updates (Docker, K8s, Terraform)
- `docs/<description>`: Documentation changes

### Commit Messages (Conventional Commits)
We enforce the Conventional Commits specification:
```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `sec`: Security vulnerability remediations or security policy additions
- `refactor`: Code refactoring without changing functionality
- `infra`: Changes to Docker, K8s, Terraform, or local dev environments
- `ci`: Changes to CI/CD workflows and automation scripts
- `docs`: Documentation updates
- `test`: Adding or updating tests

**Scopes**:
- `web`, `dashboard`, `identity`, `orders`, `notifications`, `infra`, `security`, `root`

**Example**:
```
feat(identity): add health check endpoint and gunicorn config
sec(orders): update spring boot actuator security policy
```

---

## 🛠️ Code Standards by Technology

- **TypeScript / JavaScript (`apps/web`, `apps/dashboard`, `apps/notification-service`)**:
  - Follow standard ESLint and Prettier formatting (2 spaces).
  - Explicit typing preferred in TypeScript files.
- **Python (`apps/identity-service`)**:
  - Follow PEP 8 style standards (4 spaces).
  - Type hints recommended for view functions and business models.
- **Java (`apps/orders-service`)**:
  - Standard Java formatting (4 spaces).
  - Use constructor injection for Spring components.
- **Dockerfiles**:
  - Multi-stage builds are required.
  - Run as non-root user.
  - Pin base image tags (e.g. `node:20-alpine`, `eclipse-temurin:21-jre-alpine`).

---

## 🔒 Security Best Practices for Contributions

- **Never Commit Secrets**: Do not commit `.env`, private keys, API keys, or certificates.
- **Validate Dependencies**: Ensure all third-party dependencies are pinned to stable, vulnerability-free versions.
- **Principle of Least Privilege**: Ensure containers and service accounts declare only necessary permissions.
