# Kubernetes Workload Orchestration (`infrastructure/kubernetes`)

This directory contains the declarative Kubernetes workload manifests for all microservices and frontends in the DevSecOps monorepo, organized using **Kustomize**.

For the complete architectural design, service inventories, and security matrices, refer to [docs/architecture/infrastructure-architecture.md](file:///c:/Users/msii/Documents/devsecops_monorepo/docs/architecture/infrastructure-architecture.md).

---

## 🎯 Directory Layout

```
infrastructure/kubernetes/
├── base/                         # Baseline Kubernetes resources
│   ├── identity-service.yaml     # Deployment, Service, ConfigMap, Secret, PVC
│   ├── orders-service.yaml       # Deployment, Service, ConfigMap, Secret
│   ├── notification-service.yaml # Deployment, Service, ConfigMap, Secret
│   ├── web.yaml                  # Deployment, Service, ConfigMap
│   ├── dashboard.yaml            # Deployment, Service, ConfigMap
│   ├── ingress.yaml              # Edge TLS termination and path routing
│   ├── network-policies.yaml     # Zero-trust microsegmentation rules
│   └── kustomization.yaml        # Base Kustomize manifest list
│
└── overlays/                     # Environment-specific overlays
    ├── dev/                      # Local Kind / development overrides
    ├── staging/                  # Ephemeral CI staging deployment target
    └── production/               # Production cluster with strict PSS & high availability
```

---

## 🔒 Kubernetes Security Controls

1. **Pod Security Standards (PSS)**: Enforces `restricted` profile across application namespaces.
2. **SecurityContext**:
   - `runAsNonRoot: true`
   - `allowPrivilegeEscalation: false`
   - `readOnlyRootFilesystem: true` (with temporary `/tmp` emptyDir where required)
   - `capabilities: { drop: ["ALL"] }`
3. **NetworkPolicies**: Default deny-all ingress and egress with explicit microservice communication channels.
4. **Supply Chain Admission Verification**: Consumes immutable image digests (`@sha256:...`) with Cosign signature validation.
