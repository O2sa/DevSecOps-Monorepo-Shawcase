# ==============================================================================
# DevSecOps PoC Monorepo - Local Development Environment Check (PowerShell)
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  DevSecOps Monorepo - Developer Setup & Checks   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVer = node -v
    Write-Host "[OK] Node.js: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Node.js is missing! (Required for Web, Dashboard, Notification Service)" -ForegroundColor Red
}

# Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pyVer = python --version
    Write-Host "[OK] Python: $pyVer" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Python is missing! (Required for Identity Service)" -ForegroundColor Red
}

# Check Java
if (Get-Command java -ErrorAction SilentlyContinue) {
    $javaVer = java -version 2>&1 | Select-Object -First 1
    Write-Host "[OK] Java: $javaVer" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Java is missing! (Required for Orders Service)" -ForegroundColor Red
}

# Check Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVer = docker --version
    Write-Host "[OK] Docker: $dockerVer" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Docker is missing! (Recommended for running full stack via Compose)" -ForegroundColor Yellow
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "To start all services with Docker Compose:" -ForegroundColor White
Write-Host "  docker compose up --build" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
