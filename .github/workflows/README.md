# GitHub Actions Workflows (`.github/workflows`)

> [!NOTE]
> **Phase 4 - Phase 7 DevSecOps Target**: CI/CD security pipelines are staged here for progressive implementation.

---

## 🎯 Planned Workflow Pipelines

1. **`pr-security-gates.yml`** (Phase 4):
   - Triggers on pull requests targeting `main`.
   - Runs Semgrep SAST across all 5 applications.
   - Runs dependency vulnerability audits (SCA) for Node, Python, and Java.
   - Runs Gitleaks secret detection scan.

2. **`build-and-sbom.yml`** (Phase 5 & 6):
   - Triggers on merge to `main`.
   - Builds multi-stage container images.
   - Generates CycloneDX / SPDX SBOMs using Syft.
   - Scans images for vulnerabilities using Trivy.
   - Signs images using Cosign with keyless OIDC.

3. **`dast-scan.yml`** (Phase 7):
   - Triggers against deployed staging environment.
   - Executes automated OWASP ZAP baseline and API security scans.
