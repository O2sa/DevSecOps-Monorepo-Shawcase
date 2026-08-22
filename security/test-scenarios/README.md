# Security Test Scenarios & DAST (`security/test-scenarios`)

> [!NOTE]
> **Phase 7 DevSecOps Target**: Dynamic Application Security Testing (DAST) and automated penetration test scenarios are staged here.

---

## 🎯 Planned Scenarios Catalog

1. **Authentication & Session Tests**:
   - Brute-force resilience & rate-limiting tests.
   - JWT forgery and invalid signature handling tests on Identity Service.

2. **Injection & Input Validation Scenarios**:
   - SQLi payloads against Identity and Orders services.
   - Cross-Site Scripting (XSS) validation on Next.js and Angular frontends.

3. **Broken Access Control & IDOR**:
   - Cross-tenant order inspection tests.
   - Unauthorized administrative endpoint access tests.

4. **Automated DAST Integrations**:
   - OWASP ZAP baseline and full scan configurations.
   - OpenAPI/Swagger-driven automated API fuzzing.
