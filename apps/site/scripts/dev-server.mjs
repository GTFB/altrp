#!/usr/bin/env node

/**
 * Development server that runs Next.js and Wrangler Pages in parallel
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Configuration
const NEXT_PORT = process.env.NEXT_PORT || 3100;
const WRANGLER_PORT = process.env.WRANGLER_PORT || 3300;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Formats log messages with color and prefix
 */
function log(prefix, color, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ${color}${prefix}${colors.reset} ${message}`
  );
}

/**
 * Spawns a child process with colored output
 */
function spawnProcess(name, command, args, color) {
  log(name, color, `Starting: ${command} ${args.join(' ')}`);
  
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'pipe',
    shell: true,
  });

  // Handle stdout
  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line) log(name, color, line);
    });
  });

  // Handle stderr
  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line) log(name, colors.red, line);
    });
  });

  // Handle process exit
  child.on('exit', (code, signal) => {
    if (code !== null) {
      log(name, colors.red, `Process exited with code ${code}`);
    } else if (signal !== null) {
      log(name, colors.yellow, `Process killed with signal ${signal}`);
    }
    process.exit(code || 0);
  });

  return child;
}

// Main execution
console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════╗
║   Development Server Starting...      ║
╚════════════════════════════════════════╝${colors.reset}

${colors.green}Next.js${colors.reset}      → http://localhost:${NEXT_PORT}
${colors.magenta}Wrangler${colors.reset}     → http://localhost:${WRANGLER_PORT}

${colors.dim}Press Ctrl+C to stop all processes${colors.reset}
`);

// Spawn processes
const nextProcess = spawnProcess(
  '[Next.js]',
  'next',
  ['dev', '-p', NEXT_PORT],
  colors.green
);

const wranglerProcess = spawnProcess(
  '[Wrangler]',
  'wrangler',
  ['pages', 'dev', '--port', WRANGLER_PORT],
  colors.magenta
);

// Handle shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down processes...${colors.reset}`);
  nextProcess.kill('SIGTERM');
  wranglerProcess.kill('SIGTERM');
  
  setTimeout(() => {
    nextProcess.kill('SIGKILL');
    wranglerProcess.kill('SIGKILL');
    process.exit(0);
  }, 3000);
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
  wranglerProcess.kill('SIGTERM');
  process.exit(0);
});

// Keep process alive
process.stdin.resume();

