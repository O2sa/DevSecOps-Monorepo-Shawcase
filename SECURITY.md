# Security Policy

## Reporting a Vulnerability

We take the security of DevSecOps-Monorepo-Shawcase seriously. If you discover a security vulnerability, please do not open a public issue. Instead, follow the steps below:

### How to report

1. **Email:** Please send a detailed report to osama.f.mabkhot@gmail.com or use GitHub's Private Vulnerability Reporting.
2. **Details:** Include a description of the vulnerability, steps to reproduce, and the potential impact.
3. **Response:** You can expect an acknowledgment within 1 week.

### Scope

This policy covers the core DevSecOps-Monorepo-Shawcase application and its services. It does not cover the third-party dependencies (though we appreciate reports regarding how we use them).

## Best Practices for Contributors

To keep this project secure, please keep the following in mind:

- **Environment Variables:** Never commit your `.env` file.
- **Dependency Updates:** We use automated tools to keep our dependencies up to date. Please ensure your PRs do not introduce insecure or outdated packages.

## Security Controls

- **Code Scanning:** We use GitHub Actions to run automated security scans on every Pull Request.
- **Secret Scanning:** GitHub's secret scanning is enabled to prevent the accidental leak of tokens.

---

_Thank you for helping keep DevSecOps-Monorepo-Shawcase safe for the open-source community!_
