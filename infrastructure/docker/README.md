# Docker Infrastructure (`infrastructure/docker`)

This directory houses development overlays, networking configurations, and container-related utilities.

---

## 📄 Files Overview

- **`docker-compose.dev.yml`**: Docker Compose override configuration for local development with live code reloading and volume mounts.
- Root **`docker-compose.yml`**: Production-like multi-container orchestration with multi-stage builds.

---

## 🛠️ Usage

### Running with Development Hot-Reloading Overrides
```bash
docker compose -f ../../docker-compose.yml -f docker-compose.dev.yml up
```
