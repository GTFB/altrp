#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
 * Extract database_id from wrangler output
 */
function extractDatabaseId(output) {
  // Try to find database_id in the output
  // Format: database_id = "xxxx-xxxx-xxxx-xxxx"
  const idMatch = output.match(/database_id\s*=\s*["']([^"']+)["']/);
  if (idMatch) {
    return idMatch[1];
  }
  
  // Alternative format: database_id: "xxxx-xxxx-xxxx-xxxx"
  const idMatch2 = output.match(/database_id[:\s]+["']([^"']+)["']/);
  if (idMatch2) {
    return idMatch2[1];
  }
  
  // Try to find UUID pattern
  const uuidMatch = output.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  
  return null;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔧 D1 Database Creation Script');
    console.log('='.repeat(60) + '\n');
    
    // Get database name from wrangler.toml
    const databaseName = await getDatabaseName(WRANGLER_CONFIG);
    console.log(`📊 Database name: ${databaseName}\n`);
    
    // Create database
    console.log(`🚀 Creating database "${databaseName}"...\n`);
    const wranglerConfigPath = join(__dirname, '../wrangler.toml');
    const command = `wrangler d1 create ${databaseName} --config=${wranglerConfigPath}`;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      
      const output = stdout + (stderr || '');
      console.log(output);
      
      // Extract database_id from output
      const databaseId = extractDatabaseId(output);
      
      if (databaseId) {
        console.log('\n' + '='.repeat(60));
        console.log('✅ Database created successfully!');
        console.log('='.repeat(60));
        console.log(`\n📋 Database ID: ${databaseId}\n`);
        console.log('📝 Add this to your wrangler.toml:');
        console.log(`database_id = "${databaseId}"\n`);
      } else {
        console.log('\n⚠️  Could not extract database_id from output.');
        console.log('Please check the output above and manually add database_id to wrangler.toml\n');
      }
      
      process.exit(0);
    } catch (error) {
      // Check if database already exists
      if (error.stderr && error.stderr.includes('already exists')) {
        console.log(`\n⚠️  Database "${databaseName}" already exists.`);
        console.log('If you need the database_id, check your wrangler.toml file.\n');
        process.exit(0);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

main();

