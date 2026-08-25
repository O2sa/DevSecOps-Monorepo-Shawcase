# GitHub Actions Workflows (`.github/workflows`)

> [!NOTE]
> **DevSecOps Security Pipelines**: CI/CD automation and security enforcement workflows for continuous integration, artifact packaging, supply chain security, and staging DAST.

---

## 🎯 Active Workflow Pipelines

1. **`ci.yml`** (CI & Pull Request Security Gates):
   - Triggers on pull requests and pushes targeting `main`.
   - Runs Prettier and ESLint code quality checks.
   - Executes multi-engine secret detection via Gitleaks.
   - Runs unit and integration test suites across all 5 applications.
   - Performs Semgrep SAST vulnerability scanning.
   - Executes Trivy filesystem & dependency vulnerability scans (SCA).

2. **`secure-build.yml`** (Secure Build & Supply Chain):
   - Triggers on merge to `main` and release tags (`v*.*.*`).
   - Builds multi-stage container images via Docker Buildx.
   - Scans container images with Trivy (failing on unexempted Critical vulnerabilities).
   - Generates SPDX Software Bill of Materials (SBOM) using Syft.
   - Cryptographically attests SBOM and SLSA Build Provenance to immutable image digests.
   - Signs immutable container image digests using Sigstore Cosign with keyless OIDC.
   - Publishes image digest artifacts for downstream staging deployment.

3. **`staging-dast.yml`** (Staging Deployment & DAST):
   - Triggers automatically upon successful completion of `secure-build.yml` on `main`, or via manual dispatch.
   - Downloads and resolves exact immutable image digests from the secure build run.
   - Enforces pre-deployment Cosign signature verification without bypasses.
   - Deploys ephemeral staging environment using exact immutable digests.
   - Validates application readiness and executes functional smoke tests.
   - Executes isolated OWASP ZAP baseline and REST API security scans across all 5 services.
   - Enforces DAST security policy gate: blocks pipeline on High/Critical findings while logging Medium/Low/Info.
   - Always uploads structured DAST security reports as build artifacts before tearing down the stack.
