# ==============================================================================
# Multi-stage Dockerfile for Express Notification Service
# ==============================================================================

# 1. Dependencies stage
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# 2. Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8003

# Security: Set file ownership to unprivileged 'node' user
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

USER node

EXPOSE 8003

CMD ["node", "src/index.js"]
