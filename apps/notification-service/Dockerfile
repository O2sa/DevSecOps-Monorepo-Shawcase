# ==============================================================================
# Production Dockerfile for Express Notification Service (TypeScript)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8003

# Copy application manifest, pre-built distribution, and dependencies
COPY package*.json ./
COPY --chown=node:node node_modules ./node_modules
COPY --chown=node:node dist ./dist

# Security: Run as unprivileged node user
USER node

EXPOSE 8003

CMD ["node", "dist/server.js"]
