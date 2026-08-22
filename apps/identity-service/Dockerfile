# ==============================================================================
# Dockerfile for Django Identity Service
# ==============================================================================

# 1. Builder stage
FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# 2. Production runner stage
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8001
ENV PATH=/home/appuser/.local/bin:$PATH

# Security: Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 --no-create-home appuser && \
    mkdir -p /home/appuser/.local && \
    chown -R appuser:appgroup /home/appuser

# Copy installed wheels/packages from builder
COPY --from=builder --chown=appuser:appgroup /root/.local /home/appuser/.local

# Copy application source and entrypoint
COPY --chown=appuser:appgroup . .

# Ensure entrypoint script is executable
RUN chmod +x /app/docker-entrypoint.sh

USER appuser

EXPOSE 8001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "2", "--threads", "4", "config.wsgi:application"]
