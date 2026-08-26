# ==============================================================================
# Multi-stage Dockerfile for Express Notification Service (pnpm)
# ==============================================================================

# 1. Builder stage
FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.29.2

COPY package.json tsconfig.json ./
RUN pnpm install

COPY src ./src
RUN pnpm run build

# 2. Production runner stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8003

RUN npm install -g pnpm@10.29.2

COPY package.json ./
RUN pnpm install --prod

# Copy compiled JavaScript output from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Security: Run as unprivileged node user
USER node

EXPOSE 8003

CMD ["node", "dist/server.js"]
