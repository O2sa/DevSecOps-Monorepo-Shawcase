# Kubernetes Infrastructure (`infrastructure/kubernetes`)

> [!NOTE]
> **Phase 8 DevSecOps Target**: Kubernetes manifests, Helm charts, and Kustomize overlays are intentionally not implemented in Phase 1.

---

## 🎯 Planned Structure & Responsibilities

When implemented in **Phase 8 (Kubernetes Security)**, this directory will contain:

```
infrastructure/kubernetes/
├── base/                       # Shared baseline manifests
│   ├── web/                    # Deployment, Service, Ingress, HPA
│   ├── dashboard/
│   ├── identity-service/
│   ├── orders-service/
│   ├── notification-service/
│   └── network-policies/       # Zero-trust microsegmentation NetworkPolicies
├── overlays/
│   ├── dev/                    # Development environment overrides
│   ├── staging/                # Staging environment (DAST target)
│   └── prod/                   # Production environment (strict security contexts)
└── helm/                       # Unified Helm Chart
```

---

## 🔒 Planned Kubernetes Security Controls

- **Pod Security Standards (PSS)**: Enforce `restricted` profile.
- **SecurityContext**: `readOnlyRootFilesystem: true`, `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, drop all Linux capabilities (`drop: ["ALL"]`).
- **Network Policies**: Default deny-all ingress/egress with explicit whitelisting between services.
- **Admission Controllers**: Policy validation via OPA/Gatekeeper and Kyverno.
