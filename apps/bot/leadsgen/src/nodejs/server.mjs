import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());

// Initialize PostgreSQL connection
let pool;
let dbAdapter;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });
  
  // Test connection
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
  
  // Import PostgreSQL adapter (compiled from TypeScript)
  let PostgresD1Adapter;
  const adapterCandidates = [
    '../../dist/nodejs/postgres-d1-adapter.js',
    '../../dist/nodejs/nodejs/postgres-d1-adapter.js',
  ];
  for (const candidate of adapterCandidates) {
    try {
      ({ PostgresD1Adapter } = require(candidate));
      break;
    } catch (error) {
      if (candidate === adapterCandidates[adapterCandidates.length - 1]) {
        throw new Error(`Unable to load Postgres adapter. Tried: ${adapterCandidates.join(', ')}`);
      }
    }
  }
  dbAdapter = new PostgresD1Adapter(pool);
} else {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// Validate required environment variables
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set');
  process.exit(1);
}

if (!process.env.ADMIN_CHAT_ID) {
  console.error('❌ ADMIN_CHAT_ID not set');
  process.exit(1);
}

// Create environment object compatible with TelegramBotWorker
const env = {
  DB: dbAdapter, // PostgreSQL adapter that mimics D1Database
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
  TRANSCRIPTION_API_TOKEN: process.env.TRANSCRIPTION_API_TOKEN || '',
  NODE_ENV: process.env.NODE_ENV || 'production',
  LOCALE: process.env.LOCALE || 'ru',
  AI_API_URL: process.env.AI_API_URL || '',
  AI_API_TOKEN: process.env.AI_API_TOKEN || '',
};

// Import bot worker (will be compiled from TypeScript)
let TelegramBotWorker;
const workerCandidates = [
  '../../dist/nodejs/worker/bot.js',
  '../../dist/nodejs/nodejs/worker/bot.js',
];
for (const candidate of workerCandidates) {
  try {
    ({ TelegramBotWorker } = require(candidate));
    break;
  } catch (error) {
    if (candidate === workerCandidates[workerCandidates.length - 1]) {
      throw new Error(`Unable to load TelegramBotWorker. Tried: ${workerCandidates.join(', ')}`);
    }
  }
}
console.log('✅ Bot worker initialized');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Telegram webhook endpoint (root path)
app.post('/', async (req, res) => {
  try {
    console.log('📨 Received Telegram webhook update');
    
    if (!TelegramBotWorker) {
      console.error('❌ Bot worker not initialized');
      return res.status(500).json({ error: 'Bot not initialized' });
    }

    // Create bot instance for each request (or reuse, depending on bot design)
    const bot = new TelegramBotWorker(env);
    
    // Convert Express request to Fetch API Request
    const request = new Request('http://localhost/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Handle request using bot
    const response = await bot.handleRequest(request);
    
    // Convert Fetch API Response to Express response
    const responseBody = await response.text();
    const statusCode = response.status;
    
    res.status(statusCode).send(responseBody);
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Telegram bot server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://${HOST}:${PORT}/`);
});

