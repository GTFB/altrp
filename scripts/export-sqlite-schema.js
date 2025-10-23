#!/usr/bin/env bun
/**
 * Script to export SQLite schema to D1-compatible SQL file
 * 
 * Extracts the complete schema from an existing SQLite database
 * and saves it as a SQL file ready for D1 Database.
 * 
 * Usage: bun scripts/export-sqlite-schema.js [database-path] [output-file]
 * 
 * Examples:
 *   bun scripts/export-sqlite-schema.js data/app.database.sqlite migrations/site/app-schema.sql
 *   bun scripts/export-sqlite-schema.js data/cms.database.sqlite migrations/site/cms-schema.sql
 */

const { Database } = require('bun:sqlite');
const fs = require('fs');
const path = require('path');

// Default paths
const DEFAULT_DB_PATH = 'data/app.database.sqlite';
const DEFAULT_OUTPUT = 'migrations/site/app-schema.sql';

// Get arguments
const args = process.argv.slice(2);
const dbPath = path.resolve(args[0] || DEFAULT_DB_PATH);
const outputPath = path.resolve(args[1] || DEFAULT_OUTPUT);

console.log('📦 SQLite Schema Exporter → D1 SQL');
console.log('===================================\n');
console.log(`Database: ${dbPath}`);
console.log(`Output:   ${outputPath}\n`);

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Error: Database file not found: ${dbPath}`);
  process.exit(1);
}

try {
  // Open SQLite database
  const db = new Database(dbPath, { readonly: true });
  
  console.log('🔍 Analyzing database...\n');

  // Get all schema objects (tables, indexes, triggers, views)
  const schemaQuery = `
    SELECT type, name, sql 
    FROM sqlite_master 
    WHERE sql NOT NULL 
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_cf_%'
    ORDER BY 
      CASE type
        WHEN 'table' THEN 1
        WHEN 'index' THEN 2
        WHEN 'trigger' THEN 3
        WHEN 'view' THEN 4
        ELSE 5
      END,
      name
  `;

  const schemaObjects = db.query(schemaQuery).all();

  if (schemaObjects.length === 0) {
    console.error('⚠️  Warning: No schema objects found in database');
    process.exit(1);
  }

  // Group by type
  const byType = {};
  schemaObjects.forEach(obj => {
    if (!byType[obj.type]) byType[obj.type] = [];
    byType[obj.type].push(obj);
  });

  // Statistics
  console.log('Found schema objects:');
  Object.keys(byType).forEach(type => {
    console.log(`  ${type}s: ${byType[type].length}`);
  });
  console.log();

  // Generate SQL file content
  const sqlParts = [
    '-- Exported from SQLite database',
    `-- Source: ${path.basename(dbPath)}`,
    `-- Exported: ${new Date().toISOString()}`,
    `-- Total objects: ${schemaObjects.length}`,
    '',
    '-- This schema is compatible with Cloudflare D1 Database',
    '',
  ];

  // Add tables
  if (byType.table) {
    sqlParts.push('-- ============================================');
    sqlParts.push('-- TABLES');
    sqlParts.push('-- ============================================');
    sqlParts.push('');
    
    byType.table.forEach(obj => {
      sqlParts.push(`-- Table: ${obj.name}`);
      sqlParts.push(obj.sql + ';');
      sqlParts.push('');
    });
  }

  // Add indexes
  if (byType.index) {
    sqlParts.push('-- ============================================');
    sqlParts.push('-- INDEXES');
    sqlParts.push('-- ============================================');
    sqlParts.push('');
    
    byType.index.forEach(obj => {
      // Skip auto-created indexes
      if (!obj.sql) return;
      sqlParts.push(`-- Index: ${obj.name}`);
      sqlParts.push(obj.sql + ';');
      sqlParts.push('');
    });
  }

  // Add triggers
  if (byType.trigger) {
    sqlParts.push('-- ============================================');
    sqlParts.push('-- TRIGGERS');
    sqlParts.push('-- ============================================');
    sqlParts.push('');
    
    byType.trigger.forEach(obj => {
      sqlParts.push(`-- Trigger: ${obj.name}`);
      sqlParts.push(obj.sql + ';');
      sqlParts.push('');
    });
  }

  // Add views
  if (byType.view) {
    sqlParts.push('-- ============================================');
    sqlParts.push('-- VIEWS');
    sqlParts.push('-- ============================================');
    sqlParts.push('');
    
    byType.view.forEach(obj => {
      sqlParts.push(`-- View: ${obj.name}`);
      sqlParts.push(obj.sql + ';');
      sqlParts.push('');
    });
  }

  const finalSql = sqlParts.join('\n');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write SQL file
  fs.writeFileSync(outputPath, finalSql, 'utf-8');

  // Close database
  db.close();

  console.log('✅ Schema exported successfully!\n');
  console.log(`File: ${outputPath}`);
  console.log(`Size: ${(finalSql.length / 1024).toFixed(2)} KB\n`);
  
  console.log('Next steps:');
  console.log('1. Review the generated SQL file');
  console.log('2. Apply to D1:');
  console.log('   cd apps/site');
  console.log('   wrangler d1 execute altrp-site-db --local --file=' + path.relative(path.join(__dirname, '../apps/site'), outputPath).replace(/\\/g, '/'));
  console.log('   wrangler d1 execute altrp-site-db --remote --file=' + path.relative(path.join(__dirname, '../apps/site'), outputPath).replace(/\\/g, '/'));

} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}

