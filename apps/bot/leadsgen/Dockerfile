# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY apps/bot/leadsgen/package.json ./apps/bot/leadsgen/package.json
COPY package.json ./package.json

# Install dependencies
WORKDIR /app/apps/bot/leadsgen
RUN npm install --legacy-peer-deps

# Copy TypeScript configs
COPY apps/bot/leadsgen/tsconfig.worker.json ./tsconfig.worker.json
COPY apps/bot/leadsgen/tsconfig.nodejs.json ./tsconfig.nodejs.json

# Copy source code
WORKDIR /app
COPY apps/bot/leadsgen ./apps/bot/leadsgen

# Build TypeScript to JavaScript
WORKDIR /app/apps/bot/leadsgen
RUN npm run generate-flows-index
RUN npm run build:nodejs

# Copy migrations at the end of builder stage
WORKDIR /app
COPY migrations/site ./migrations/site

# Verify migrations are accessible
RUN ls -la migrations/site/ || echo "WARNING: migrations not found in /app/migrations/site"

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/bot/leadsgen/dist/nodejs ./dist/nodejs
RUN ls -R dist/nodejs | head
COPY --from=builder --chown=nextjs:nodejs /app/apps/bot/leadsgen/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/bot/leadsgen/src/nodejs/server.mjs ./src/nodejs/server.mjs

# Copy migration scripts
COPY --from=builder --chown=nextjs:nodejs /app/apps/bot/leadsgen/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/migrations/site ./migrations

# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Make entrypoint script executable
RUN chmod +x ./scripts/docker-entrypoint.sh

USER nextjs

EXPOSE 3100

ENV PORT=3100
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
