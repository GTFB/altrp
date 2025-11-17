# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (lightningcss, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy TypeScript configs first
COPY tsconfig.json ./
COPY apps/site/tsconfig.json ./apps/site/

# Copy settings.ts (needed for @/settings alias - must be in root)
COPY settings.ts ./

# Copy packages directory (shared dependencies - needed before building)
COPY packages ./packages

# Copy workspace package files
COPY apps/site/package.json ./apps/site/package.json

# Install site dependencies directly (skip root dependencies for monorepo)
WORKDIR /app/apps/site
RUN npm install --legacy-peer-deps

# Verify settings.ts is accessible (for debugging)
RUN ls -la /app/settings.ts || echo "WARNING: settings.ts not found in /app"

# Copy source code
WORKDIR /app
COPY apps/site ./apps/site

# Build the application
WORKDIR /app/apps/site
RUN npm run build

# Copy migrations at the end of builder stage (to ensure they're available for production stage)
WORKDIR /app
COPY migrations/site ./migrations/site

# Verify migrations are accessible (for debugging)
RUN ls -la migrations/site/ || echo "WARNING: migrations not found in /app/migrations/site"
RUN find . -name "*.sql" -path "*/migrations/*" | head -5 || echo "WARNING: no SQL files found"

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/site/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/site/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/site/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/site/next.config.js ./next.config.js

# Copy migration scripts
COPY --from=builder --chown=nextjs:nodejs /app/apps/site/scripts ./scripts
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

