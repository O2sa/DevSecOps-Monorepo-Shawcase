# ==============================================================================
# Dockerfile for Django Identity Service
# ==============================================================================
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8001
ENV HOME=/app
ENV TMPDIR=/tmp

# Security: Create non-root user and persistent data directory
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 --home /app appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appgroup /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source and entrypoint
COPY --chown=appuser:appgroup . .

RUN chmod +x /app/docker-entrypoint.sh && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "2", "--threads", "4", "config.wsgi:application"]
