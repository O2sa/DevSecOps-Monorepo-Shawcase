# ==============================================================================
# Multi-stage Dockerfile for Angular Dashboard
# ==============================================================================

# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Production unprivileged runtime stage
FROM nginxinc/nginx-unprivileged:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/devsecops-dashboard/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
