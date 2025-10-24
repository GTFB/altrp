#!/usr/bin/env node

import { rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const D1_LOCAL_PATH = 'apps/site/.wrangler/state/v3/d1';

/**
 * Reset local D1 database by removing the .wrangler state directory
 */
async function resetLocalD1() {
  console.log('🗑️  D1 Local Database Reset Script');
  console.log('='.repeat(60) + '\n');
  
  try {
    if (!existsSync(D1_LOCAL_PATH)) {
      console.log('⚠️  Local D1 database directory not found.');
      console.log(`   Path: ${D1_LOCAL_PATH}`);
      console.log('   Nothing to delete.\n');
      return;
    }
    
    console.log(`📂 Found local D1 database at: ${D1_LOCAL_PATH}`);
    console.log('🗑️  Removing local D1 database...\n');
    
    await rm(D1_LOCAL_PATH, { recursive: true, force: true });
    
    console.log('✅ Local D1 database removed successfully!');
    console.log('\nYou can now run migrations to recreate the database:');
    console.log('   npm run migrate:site:local\n');
    
  } catch (error) {
    console.error('❌ Error removing local D1 database:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

resetLocalD1();

