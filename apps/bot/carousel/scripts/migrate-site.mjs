#!/usr/bin/env node

import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_SOURCE = join(__dirname, '../../apps/app/src/migrations');
const MIGRATIONS_TARGET = join(__dirname, '../../../../migrations/site');
const WRANGLER_CONFIG = join(__dirname, '../wrangler.toml');

/**
 * Extract database_name from wrangler.toml
 */
async function getDatabaseName(wranglerConfigPath) {
  try {
    const content = await readFile(wranglerConfigPath, 'utf-8');
    
    // Find [[d1_databases]] section and extract database_name
    // Match from [[d1_databases]] to next [[ or end of file
    const d1SectionMatch = content.match(/\[\[d1_databases\]\][\s\S]*?(?=\[\[|$)/);
    if (!d1SectionMatch) {
      throw new Error('Could not find [[d1_databases]] section in wrangler.toml');
    }
    
    const databaseNameMatch = d1SectionMatch[0].match(/database_name\s*=\s*["']([^"']+)["']/);
    if (!databaseNameMatch) {
      throw new Error('Could not find database_name in [[d1_databases]] section');
    }
    
    return databaseNameMatch[1];
  } catch (error) {
    console.error(`❌ Error reading database_name from ${wranglerConfigPath}:`, error.message);
    throw error;
  }
}

/**
 * Extract SQL statements from TypeScript migration file (only from up() function)
 */
function extractSqlFromTs(content) {
  const sqlStatements = [];
  
  // Find the up() function block
  const upFunctionStart = content.indexOf('export async function up(');
  const downFunctionStart = content.indexOf('export async function down(');
  
  if (upFunctionStart === -1) {
    console.error('Could not find up() function in migration file');
    return sqlStatements;
  }
  
  // Limit search to up() function only (stop at down() function if it exists)
  const searchEnd = downFunctionStart !== -1 ? downFunctionStart : content.length;
  const upFunctionContent = content.substring(upFunctionStart, searchEnd);
  
  // Find all db.run(sql`...`) calls within up() function
  // We need to handle escaped backticks inside the SQL
  let currentPos = 0;
  
  while (currentPos < upFunctionContent.length) {
    // Find the start of db.run(sql`
    const startMatch = upFunctionContent.indexOf('await db.run(sql`', currentPos);
    if (startMatch === -1) break;
    
    // Start looking for the closing backtick after sql`
    let sqlStart = startMatch + 'await db.run(sql`'.length;
    let pos = sqlStart;
    let foundEnd = false;
    
    // Find the matching closing backtick, handling escaped backticks
    while (pos < upFunctionContent.length) {
      if (upFunctionContent[pos] === '\\' && pos + 1 < upFunctionContent.length) {
        // Skip escaped character
        pos += 2;
        continue;
      }
      
      if (upFunctionContent[pos] === '`') {
        // Found unescaped backtick - this is our closing backtick
        foundEnd = true;
        break;
      }
      
      pos++;
    }
    
    if (foundEnd) {
      const sqlStatement = upFunctionContent
        .substring(sqlStart, pos)
        .replace(/\\`/g, '`') // Unescape backticks
        .trim();
      
      if (sqlStatement) {
        sqlStatements.push(sqlStatement);
      }
      
      currentPos = pos + 1;
    } else {
      break;
    }
  }
  
  return sqlStatements;
}

/**
 * Convert TS migration to SQL file
 */
async function convertMigrationToSql(tsFilePath) {
  const content = await readFile(tsFilePath, 'utf-8');
  const sqlStatements = extractSqlFromTs(content);
  
  if (sqlStatements.length === 0) {
    console.log(`⚠️  No SQL statements found in ${basename(tsFilePath)}`);
    return null;
  }
  
  // Process each statement - ensure it ends with semicolon
  const processedStatements = sqlStatements.map(stmt => {
    const trimmed = stmt.trim();
    // Add semicolon only if not already present
    return trimmed.endsWith(';') ? trimmed : trimmed + ';';
  });
  
  // Join all SQL statements with double newlines for readability
  const sqlContent = processedStatements.join('\n\n');
  
  return sqlContent;
}

/**
 * Get all TypeScript migration files
 */
async function getTsMigrations() {
  try {
    const files = await readdir(MIGRATIONS_SOURCE);
    return files
      .filter(file => file.endsWith('.ts') && file !== 'index.ts')
      .sort();
  } catch (error) {
    // If source directory doesn't exist, return empty array
    return [];
  }
}

/**
 * Get all SQL migration files directly from migrations/site
 */
async function getSqlMigrations() {
  try {
    const files = await readdir(MIGRATIONS_TARGET);
    return files
      .filter(file => file.endsWith('.sql') && file !== '_init_migrations_table.sql')
      .sort()
      .map(file => join(MIGRATIONS_TARGET, file));
  } catch (error) {
    console.error(`❌ Error reading migrations directory: ${error.message}`);
    throw error;
  }
}

/**
 * Check if SQL migration already exists
 */
async function sqlMigrationExists(sqlPath) {
  try {
    await access(sqlPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert all TS migrations to SQL
 */
async function convertMigrations() {
  console.log('🔄 Converting TypeScript migrations to SQL...\n');
  
  const tsMigrations = await getTsMigrations();
  const converted = [];
  
  for (const tsFile of tsMigrations) {
    const tsPath = join(MIGRATIONS_SOURCE, tsFile);
    const sqlFileName = tsFile.replace('.ts', '.sql');
    const sqlPath = join(MIGRATIONS_TARGET, sqlFileName);
    
    // Check if SQL migration already exists
    if (await sqlMigrationExists(sqlPath)) {
      console.log(`✓ ${sqlFileName} already exists, skipping conversion`);
      converted.push(sqlPath);
      continue;
    }
    
    // Convert TS to SQL
    console.log(`Converting ${tsFile}...`);
    const sqlContent = await convertMigrationToSql(tsPath);
    
    if (sqlContent) {
      await writeFile(sqlPath, sqlContent, 'utf-8');
      console.log(`✓ Created ${sqlFileName}\n`);
      converted.push(sqlPath);
    }
  }
  
  return converted;
}

/**
 * Ensure migrations table exists
 */
async function ensureMigrationsTable(databaseName, mode) {
  // Use the static SQL file for migrations table
  const initSqlPath = join(MIGRATIONS_TARGET, '_init_migrations_table.sql');
  
  try {
    // Execute using the static SQL file
    const command = `wrangler d1 execute ${databaseName} --file=${initSqlPath} --config=${WRANGLER_CONFIG} ${mode}`;
    
    await execAsync(command);
    
    // Verify table was created
    const verifyCommand = `wrangler d1 execute ${databaseName} --command="SELECT name FROM sqlite_master WHERE type='table' AND name='_migrations';" --config=${WRANGLER_CONFIG} ${mode} --json`;
    const { stdout } = await execAsync(verifyCommand);
    const result = JSON.parse(stdout);
    
    if (result && result[0] && result[0].results && result[0].results.length > 0) {
      return true;
    }
    
    console.error('⚠️  Migrations table was not created successfully');
    return false;
  } catch (error) {
    console.error('Failed to create migrations table:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    return false;
  }
}

/**
 * Check if migration has already been executed
 */
async function isMigrationExecuted(databaseName, migrationName, mode) {
  const checkSQL = `SELECT name FROM _migrations WHERE name = '${migrationName}';`;
  const command = `wrangler d1 execute ${databaseName} --command="${checkSQL}" --config=${WRANGLER_CONFIG} ${mode} --json`;
  
  try {
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);
    
    // Check if we got any results
    if (result && result[0] && result[0].results && result[0].results.length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    // If table doesn't exist or query fails, assume migration not executed
    return false;
  }
}

/**
 * Record migration as executed
 */
async function recordMigration(databaseName, migrationName, mode) {
  // First, verify that migrations table exists
  try {
    const checkTableCommand = `wrangler d1 execute ${databaseName} --command="SELECT 1 FROM _migrations LIMIT 1;" --config=${WRANGLER_CONFIG} ${mode} --json`;
    await execAsync(checkTableCommand);
  } catch (error) {
    console.error('\n⚠️  Warning: _migrations table does not exist. Cannot record migration.');
    console.error('   The migration was executed successfully, but will be run again next time.');
    console.error('   Consider running: npm run db:site:d1:reset-migrate:local\n');
    return false;
  }
  
  const insertSQL = `INSERT OR IGNORE INTO _migrations (name) VALUES ('${migrationName}');`;
  const command = `wrangler d1 execute ${databaseName} --command="${insertSQL}" --config=${WRANGLER_CONFIG} ${mode}`;
  
  try {
    await execAsync(command);
    console.log(`   ✓ Migration recorded in _migrations table`);
    return true;
  } catch (error) {
    console.error('\n⚠️  Warning: Failed to record migration:', error.message);
    console.error('   The migration was executed successfully, but will be run again next time.\n');
    return false;
  }
}

/**
 * Execute SQL migration using wrangler
 */
async function executeMigration(databaseName, sqlPath, mode) {
  const fileName = basename(sqlPath);
  const migrationName = fileName.replace('.sql', '');
  
  // Check if already executed
  const alreadyExecuted = await isMigrationExecuted(databaseName, migrationName, mode);
  
  if (alreadyExecuted) {
    console.log(`\n⏭️  ${fileName} already executed, skipping...\n`);
    return true;
  }
  
  // Execute migration file
  const command = `wrangler d1 execute ${databaseName} --file=${sqlPath} --config=${WRANGLER_CONFIG} ${mode}`;
  
  console.log(`\n📝 Executing ${fileName} (${mode})...`);
  console.log(`Command: ${command}\n`);
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr && !stderr.includes('update available')) {
      // Ignore version update warnings
      console.error(stderr);
    }
    
    // Record successful migration
    await recordMigration(databaseName, migrationName, mode);
    
    console.log(`✓ Successfully executed ${fileName}\n`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to execute ${fileName}:`);
    console.error(error.message);
    
    if (error.stdout) {
      console.log('stdout:', error.stdout);
    }
    
    if (error.stderr) {
      console.error('stderr:', error.stderr);
    }
    
    return false;
  }
}

/**
 * Execute all migrations
 */
async function executeMigrations(databaseName, sqlFiles, mode) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Executing migrations (${mode})...`);
  console.log('='.repeat(60));
  
  // Ensure migrations tracking table exists
  console.log('\n📋 Ensuring migrations table exists...');
  const tableCreated = await ensureMigrationsTable(databaseName, mode);
  
  if (!tableCreated) {
    console.error('⚠️  Could not verify migrations table was created.');
    console.error('   Migrations will still run, but may be executed multiple times.');
    console.error('   Consider running: npm run db:site:d1:reset-migrate:local\n');
  } else {
    console.log('✓ Migrations table is ready\n');
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const sqlFile of sqlFiles) {
    const success = await executeMigration(databaseName, sqlFile, mode);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Completed: ${successCount} successful, ${failCount} failed`);
  console.log('='.repeat(60));
  
  return failCount === 0;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--remote')) {
    return '--remote';
  }
  
  if (args.includes('--local')) {
    return '--local';
  }
  
  // Default to local
  return '--local';
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔧 Site Migration Script');
    console.log('='.repeat(60) + '\n');
    
    // Get database name from wrangler.toml
    const databaseName = await getDatabaseName(WRANGLER_CONFIG);
    console.log(`📊 Database: ${databaseName}\n`);
    
    // Parse arguments
    const mode = parseArgs();
    console.log(`Mode: ${mode}\n`);
    
    // Step 1: Get SQL migrations (try to convert TS first, then use existing SQL)
    let sqlFiles = [];
    
    // Try to convert TS migrations if source exists
    const tsMigrations = await getTsMigrations();
    if (tsMigrations.length > 0) {
      console.log('🔄 Converting TypeScript migrations to SQL...\n');
      sqlFiles = await convertMigrations();
    }
    
    // If no converted files or conversion skipped, use existing SQL files
    if (sqlFiles.length === 0) {
      console.log('📁 Reading SQL migrations from migrations/site...\n');
      sqlFiles = await getSqlMigrations();
    }
    
    if (sqlFiles.length === 0) {
      console.log('\n⚠️  No migrations found to execute');
      return;
    }
    
    // Step 2: Execute SQL migrations
    const success = await executeMigrations(databaseName, sqlFiles, mode);
    
    if (success) {
      console.log('\n✅ All migrations completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some migrations failed. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

