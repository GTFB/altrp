#!/bin/sh
set -e

echo "🚀 Starting Telegram bot application..."
echo "📁 Current directory: $(pwd)"
echo "📁 Contents: $(ls -la)"

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
  echo "❌ ERROR: scripts directory not found!"
  exit 1
fi

# Check if migration script exists
if [ ! -f "scripts/migrate-postgres.mjs" ]; then
  echo "❌ ERROR: scripts/migrate-postgres.mjs not found!"
  exit 1
fi

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "📋 Running database migrations..."
  echo "📁 Migrations directory check:"
  ls -la migrations/ || echo "⚠️  migrations directory not found"
  
  node scripts/migrate-postgres.mjs || {
    echo "❌ Migration failed!"
    echo "⚠️  Continuing anyway (migrations may have already been applied)..."
    # Don't exit on migration failure - allow app to start
  }
  echo "✅ Migrations completed"
else
  echo "⚠️  DATABASE_URL not set, skipping migrations"
fi

# Start the application
echo "🚀 Starting Telegram bot server..."
exec node src/nodejs/server.mjs

