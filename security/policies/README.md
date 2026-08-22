# Security Policies (`security/policies`)

> [!NOTE]
> **Phase 3 & Phase 8 DevSecOps Target**: Security policy rules and admission constraints are structured here for progressive implementation.

---

## 🎯 Planned Structure & Responsibilities

```
security/policies/
├── open-policy-agent/          # Rego policies for Conftest / Gatekeeper
│   ├── container-security.rego # No root, no privileged containers
│   └── network-isolation.rego  # Required labels & ingress restrictions
├── semgrep/                    # Custom Semgrep SAST rules
│   ├── python-rules.yml        # Django SQL injection & insecure deserialization rules
│   ├── java-rules.yml          # Spring Boot actuator & auth bypass rules
│   └── js-rules.yml            # Node.js prototype pollution & XSS rules
└── kyverno/                    # Kyverno Kubernetes ClusterPolicies
```

---

## 🔒 Policy Enforcement Workflow

1. **Local Developer Validation**: Run `conftest test` against Dockerfiles and Kubernetes manifests.
2. **CI Gates**: Automated check in pull requests blocking merges on policy violations.
3. **Cluster Admission**: Gatekeeper / Kyverno rejecting non-compliant pods at deploy time.
