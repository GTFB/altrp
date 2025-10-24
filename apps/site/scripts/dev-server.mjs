#!/usr/bin/env node

/**
 * Development server with proxy fallback:
 * - Wrangler handles API routes and functions
 * - Falls back to Next.js for 404s (pages, static files)
 */

import { spawn } from 'child_process';
import { createServer, request as httpRequest } from 'http';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Configuration
const NEXT_PORT = process.env.NEXT_PORT || 3100;
const WRANGLER_PORT = process.env.WRANGLER_PORT || 3300;
const PROXY_PORT = process.env.PROXY_PORT || 3400;

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

/**
 * Proxies request to a target server
 */
async function proxyRequest(req, res, targetPort, serverName, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers },
    };

    const proxyReq = httpRequest(options, (proxyRes) => {
      // Check if response is 404
      if (proxyRes.statusCode === 404) {
        // Consume the 404 response body to prevent memory leaks
        proxyRes.resume();
        resolve({ status: 404, response: proxyRes });
        return;
      }

      // Forward successful response
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
      resolve({ status: proxyRes.statusCode, response: proxyRes });
    });

    proxyReq.on('error', (err) => {
      reject(err);
    });

    // Write body and end request
    if (body && body.length > 0) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

/**
 * Creates a proxy server with smart routing logic
 */
function createProxyServer() {
  const server = createServer(async (req, res) => {
    const url = req.url || '/';
    
    // Buffer the request body to allow retry
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    
    req.on('end', async () => {
      const body = Buffer.concat(chunks);
      
      try {
        // Route based on URL pattern
        // Next.js internal files go directly to Next.js
        if (url.startsWith('/_next/') || 
            url.startsWith('/__nextjs') ||
            url === '/favicon.ico' ||
            url.startsWith('/static/')) {
          log('[Proxy]', colors.blue, `→ Next.js: ${url}`);
          await proxyRequest(req, res, NEXT_PORT, 'Next.js', body);
          return;
        }
        
        // API routes go to Wrangler first, then fallback to Next.js
        if (url.startsWith('/api/')) {
          try {
            const wranglerResult = await proxyRequest(req, res, WRANGLER_PORT, 'Wrangler', body);
            
            if (wranglerResult.status === 404) {
              log('[Proxy]', colors.blue, `404 from Wrangler, trying Next.js: ${url}`);
              await proxyRequest(req, res, NEXT_PORT, 'Next.js', body);
            } else {
              log('[Proxy]', colors.blue, `${wranglerResult.status} from Wrangler: ${url}`);
            }
          } catch (error) {
            log('[Proxy]', colors.red, `Error from Wrangler: ${error.message}`);
            log('[Proxy]', colors.blue, `Trying Next.js fallback: ${url}`);
            await proxyRequest(req, res, NEXT_PORT, 'Next.js', body);
          }
          return;
        }
        
        // All other requests (pages, etc.) go to Next.js first
        try {
          const nextResult = await proxyRequest(req, res, NEXT_PORT, 'Next.js', body);
          
          if (nextResult.status === 404) {
            log('[Proxy]', colors.blue, `404 from Next.js, trying Wrangler: ${url}`);
            await proxyRequest(req, res, WRANGLER_PORT, 'Wrangler', body);
          } else {
            log('[Proxy]', colors.blue, `${nextResult.status} from Next.js: ${url}`);
          }
        } catch (error) {
          log('[Proxy]', colors.red, `Error from Next.js: ${error.message}`);
          log('[Proxy]', colors.blue, `Trying Wrangler fallback: ${url}`);
          await proxyRequest(req, res, WRANGLER_PORT, 'Wrangler', body);
        }
      } catch (finalError) {
        log('[Proxy]', colors.red, `All servers failed: ${finalError.message}`);
        
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Bad Gateway: All servers failed');
        }
      }
    });

    req.on('error', (err) => {
      log('[Proxy]', colors.red, `Request error: ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  });

  server.listen(PROXY_PORT, () => {
    log('[Proxy]', colors.blue, `Proxy server listening on http://localhost:${PROXY_PORT}`);
  });

  return server;
}

// Main execution
console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════╗
║   Development Server Starting...      ║
╚════════════════════════════════════════╝${colors.reset}

${colors.blue}Proxy${colors.reset}        → http://localhost:${PROXY_PORT} ${colors.dim}(Use this URL)${colors.reset}
${colors.green}Next.js${colors.reset}      → http://localhost:${NEXT_PORT}
${colors.magenta}Wrangler${colors.reset}     → http://localhost:${WRANGLER_PORT}

${colors.dim}Proxy logic: Wrangler first, then Next.js on 404${colors.reset}
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

// Wait a bit for servers to start, then create proxy
setTimeout(() => {
  const proxyServer = createProxyServer();
  
  // Handle shutdown
  const shutdown = () => {
    console.log(`\n${colors.yellow}Shutting down processes...${colors.reset}`);
    proxyServer.close();
    nextProcess.kill('SIGTERM');
    wranglerProcess.kill('SIGTERM');
    
    setTimeout(() => {
      nextProcess.kill('SIGKILL');
      wranglerProcess.kill('SIGKILL');
      process.exit(0);
    }, 3000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}, 3000);

// Keep process alive
process.stdin.resume();

