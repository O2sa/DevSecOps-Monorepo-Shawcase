# Terraform Infrastructure-as-Code (`infrastructure/terraform`)

> [!NOTE]
> **Phase 9 DevSecOps Target**: Terraform modules and cloud provisioning code are intentionally not implemented in Phase 1.

---

## 🎯 Planned Structure & Responsibilities

When implemented in **Phase 9 (IaC Security & Cloud Provisioning)**, this directory will contain:

```
infrastructure/terraform/
├── modules/
│   ├── vpc/                    # Secure VPC with private subnets
│   ├── eks-cluster/            # Managed Kubernetes cluster
│   ├── ecr/                    # Container registry with immutability & KMS encryption
│   ├── database/               # Managed PostgreSQL / RDS with encryption at rest
│   └── iam/                    # Least-privilege IAM roles and policies
├── environments/
│   ├── dev/                    # Dev environment state & variables
│   ├── staging/                # Staging environment
│   └── prod/                   # Production environment
└── README.md
```

---

## 🔒 Planned IaC Security Controls

- **Static Analysis**: Automated scanning with `checkov`, `tfsec`, and `trivy config`.
- **Cost & Drift Estimation**: `infracost` in pull request checks.
- **State File Security**: Encrypted remote backend (S3/GCS with KMS encryption and DynamoDB state locking).
- **CIS Benchmark Compliance**: Enforcing cloud security baselines across VPC, IAM, and compute resources.
