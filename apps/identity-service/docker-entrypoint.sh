#!/bin/sh
# ==============================================================================
# Identity Service - Docker Entrypoint Script
# Applies pending database migrations before starting the application server.
# Suitable for local/Docker Compose stage (may evolve for Kubernetes in Phase 8).
# ==============================================================================
set -e

echo "[Identity Service] Checking and applying database migrations..."
python manage.py migrate --noinput

echo "[Identity Service] Starting server..."
exec "$@"
