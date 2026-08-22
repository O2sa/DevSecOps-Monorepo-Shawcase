# DevSecOps Automation Scripts (`security/scripts`)

> [!NOTE]
> **Phase 3 - Phase 6 DevSecOps Target**: Automation and security orchestration scripts are prepared here for incremental deployment.

---

## 🎯 Planned Scripts Catalog

| Script | Phase | Tooling | Purpose |
|---|---|---|---|
| `scan-secrets.sh` / `.ps1` | Phase 3 | Gitleaks / TruffleHog | Detect committed credentials and secrets |
| `run-sast.sh` / `.ps1` | Phase 4 | Semgrep / SonarQube | Perform static application security analysis across all 5 apps |
| `run-sca.sh` / `.ps1` | Phase 4 | Snyk / Trivy / OSV-Scanner | Scan dependencies for known CVEs |
| `generate-sbom.sh` / `.ps1` | Phase 5 | Syft / CycloneDX | Generate Software Bill of Materials for all components |
| `scan-containers.sh` / `.ps1`| Phase 6 | Trivy / Grype | Scan built container images for vulnerabilities & misconfigurations |

---

## 🛠️ Usage in Pipelines
All scripts in this directory will adhere to standard POSIX and PowerShell conventions, accepting standard flags and returning standard non-zero exit codes upon critical severity findings.
