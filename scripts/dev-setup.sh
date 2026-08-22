#!/usr/bin/env bash
# ==============================================================================
# DevSecOps PoC Monorepo - Local Development Environment Check & Setup
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo "  DevSecOps Monorepo - Developer Setup & Checks  "
echo "=================================================="

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✓ Node.js: $(node -v)"
else
    echo "✗ Node.js is missing! (Required for Web, Dashboard, Notification Service)"
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    echo "✓ Python: $(python3 --version)"
elif command -v python >/dev/null 2>&1; then
    echo "✓ Python: $(python --version)"
else
    echo "✗ Python is missing! (Required for Identity Service)"
fi

# Check Java
if command -v java >/dev/null 2>&1; then
    echo "✓ Java: $(java -version 2>&1 | head -n 1)"
else
    echo "✗ Java is missing! (Required for Orders Service)"
fi

# Check Docker
if command -v docker >/dev/null 2>&1; then
    echo "✓ Docker: $(docker --version)"
else
    echo "✗ Docker is missing! (Recommended for running full stack via Compose)"
fi

echo "=================================================="
echo "To start all services with Docker Compose:"
echo "  docker compose up --build"
echo "=================================================="
