// Express сервер для Node.js версии бота
const express = require('express');
const cron = require('node-cron');
const { TelegramBotNode } = require('./bot');
const { PostgreSQLStorageService, RedisStorageService } = require('./storage-service');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Инициализируем сервисы хранения
const postgresStorage = new PostgreSQLStorageService(process.env.DATABASE_URL);
const redisStorage = new RedisStorageService(process.env.REDIS_URL);

// Конфигурация окружения для Node.js
const nodeEnv = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
  TRANSCRIPTION_API_TOKEN: process.env.TRANSCRIPTION_API_TOKEN,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOCALE: process.env.LOCALE || 'ru',
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  PORT: PORT
};

// Инициализируем бота
let bot;

async function initializeBot() {
  try {
    console.log('🚀 Initializing Node.js Telegram Bot...');
    
    // Инициализируем хранилища
    await postgresStorage.initialize();
    await redisStorage.initialize();
    
    // Создаем экземпляр бота
    bot = new TelegramBotNode(nodeEnv, redisStorage, postgresStorage);
    
    console.log('✅ Node.js Telegram Bot initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Webhook endpoint для Telegram
app.post('/webhook', async (req, res) => {
  try {
    if (!bot) {
      console.error('Bot not initialized');
      return res.status(500).json({ error: 'Bot not initialized' });
    }

    // Обрабатываем запрос через бота
    const response = await bot.handleRequest(req);
    
    // Отправляем ответ
    res.status(response.status).send(await response.text());
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Telegram Bot Node.js Server',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook',
      health: '/health'
    }
  });
});

// Настройка cron задач для проверки отложенных сообщений
cron.schedule('* * * * *', async () => {
  try {
    console.log('🕐 Running scheduled task: checking delayed messages');
    if (bot) {
      await bot.checkDelayedMessages();
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Запуск сервера
async function startServer() {
  try {
    await initializeBot();
    
    app.listen(PORT, () => {
      console.log(`🚀 Node.js Telegram Bot server running on port ${PORT}`);
      console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Запускаем сервер
startServer();
