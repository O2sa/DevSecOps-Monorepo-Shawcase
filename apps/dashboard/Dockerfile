# ==============================================================================
# Multi-stage Dockerfile for Angular Dashboard (pnpm)
# ==============================================================================

# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10.29.2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build --configuration production

# 2. Production unprivileged runtime stage
FROM nginxinc/nginx-unprivileged:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/devsecops-dashboard/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
