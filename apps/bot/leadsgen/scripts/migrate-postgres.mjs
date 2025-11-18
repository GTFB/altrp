#!/usr/bin/env node

/**
 * PostgreSQL Migration Script
 * Executes SQLite migration files converted to PostgreSQL syntax
 */

import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import pg from 'pg';
import { convertSqliteToPostgres } from './convert-sqlite-to-postgres.mjs';

const { Client } = pg;

// Determine migrations directory based on execution context
// In Docker: /app/migrations (from Dockerfile, copied from migrations/site)
// In development: ../../migrations/site (from project root)
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || 
  (process.cwd().includes('/app') ? '/app/migrations' : join(process.cwd(), '../../migrations/site'));

console.log(`📁 Migrations directory: ${MIGRATIONS_DIR}`);

/**
 * Get DATABASE_URL from environment
 */
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

/**
 * Ensure migrations table exists
 */
async function ensureMigrationsTable(client) {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  await client.query(createTableSql);
  console.log('✓ Migrations table is ready');
}

/**
 * Check if migration has already been executed
 */
async function isMigrationExecuted(client, migrationName) {
  const result = await client.query(
    'SELECT name FROM _migrations WHERE name = $1',
    [migrationName]
  );
  return result.rows.length > 0;
}

/**
 * Record migration as executed
 */
async function recordMigration(client, migrationName) {
  await client.query(
    'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [migrationName]
  );
  console.log(`   ✓ Migration recorded in _migrations table`);
}

/**
 * Get all migration files sorted by name
 */
async function getMigrationFiles() {
  const files = await readdir(MIGRATIONS_DIR);
  return files
    .filter(file => file.endsWith('.sql') && file !== '_init_migrations_table.sql')
    .sort()
    .map(file => join(MIGRATIONS_DIR, file));
}

/**
 * Execute a single migration file
 */
async function executeMigration(client, sqlPath) {
  const fileName = basename(sqlPath);
  const migrationName = fileName.replace('.sql', '');

  // Check if already executed
  const alreadyExecuted = await isMigrationExecuted(client, migrationName);

  if (alreadyExecuted) {
    console.log(`\n⏭️  ${fileName} already executed, skipping...`);
    return true;
  }

  // Read and convert SQL file
  console.log(`\n📝 Executing ${fileName}...`);
  const sqliteSql = await readFile(sqlPath, 'utf8');
  const postgresSql = convertSqliteToPostgres(sqliteSql);

  // Split by semicolons and execute each statement
  // PostgreSQL requires statements to be executed separately
  const statements = postgresSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  try {
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
      }
    }

    // Record successful migration
    await recordMigration(client, migrationName);

    console.log(`✓ Successfully executed ${fileName}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to execute ${fileName}:`);
    console.error(`  Error: ${error.message}`);
    if (error.position) {
      console.error(`  Position: ${error.position}`);
    }
    return false;
  }
}

/**
 * Execute all migrations
 */
async function executeMigrations() {
  console.log('🔧 PostgreSQL Migration Script');
  console.log('='.repeat(60) + '\n');

  const databaseUrl = getDatabaseUrl();
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL database\n');

    // Ensure migrations table exists
    console.log('📋 Ensuring migrations table exists...');
    await ensureMigrationsTable(client);
    console.log('');

    // Get all migration files
    const migrationFiles = await getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('⚠️  No migrations found to execute');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration(s) to execute\n`);

    let successCount = 0;
    let failCount = 0;

    // Execute migrations in order
    for (const migrationFile of migrationFiles) {
      const success = await executeMigration(client, migrationFile);
      if (success) {
        successCount++;
      } else {
        failCount++;
        // Stop on first failure
        console.error('\n⚠️  Stopping migration due to error');
        break;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Completed: ${successCount} successful, ${failCount} failed`);
    console.log('='.repeat(60));

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
executeMigrations();

