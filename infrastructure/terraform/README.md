# Terraform Infrastructure-as-Code (`infrastructure/terraform`)

This directory contains modular Terraform configurations for deterministically provisioning cloud/VPS compute nodes, networking, firewalls, and Kubernetes cluster infrastructure.

For the full responsibility matrix separating Terraform from Kubernetes workloads, see [docs/architecture/infrastructure-architecture.md](file:///c:/Users/msii/Documents/devsecops_monorepo/docs/architecture/infrastructure-architecture.md).

---

## 🎯 Directory Layout

```
infrastructure/terraform/
├── modules/                      # Reusable infrastructure modules
│   ├── networking/               # VPC, subnets, and routing tables
│   ├── compute/                  # Virtual machines / Node pools
│   ├── security/                 # Cloud security groups and firewall rules
│   └── kubernetes-cluster/       # K3s / Cloud Kubernetes cluster bootstrap
│
└── environments/                 # Environment-specific configuration
    ├── staging/                  # Staging cloud infrastructure
    │   ├── main.tf
    │   ├── variables.tf
    │   └── terraform.tfvars
    └── production/               # Production cloud infrastructure
        ├── main.tf
        ├── variables.tf
        └── terraform.tfvars
```

---

## 🔒 Planned IaC Security Controls

- **Static Analysis**: Automated scanning with `checkov`, `tfsec`, and `trivy config`.
- **Cost & Drift Estimation**: `infracost` automated budget impact analysis.
- **State File Security**: Encrypted remote backend with KMS encryption and state locking.
- **Least Privilege IAM**: Narrowly scoped cloud credentials for CI deployment runners.
