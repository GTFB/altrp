# Node.js версия Telegram бота

Эта папка содержит Node.js реализацию бота, которая использует PostgreSQL и Redis вместо Cloudflare D1 и KV.

## Структура

```
src/nodejs/
├── bot.ts              # Основная логика бота (адаптированная для Node.js)
├── storage-service.ts   # Адаптеры для PostgreSQL и Redis
├── server.js           # Express сервер
└── README.md           # Эта документация
```

## Зависимости

- **PostgreSQL** - основная база данных (аналог D1)
- **Redis** - кэширование и сессии (аналог KV)
- **Express** - HTTP сервер для webhook'ов
- **node-cron** - планировщик задач (аналог Cloudflare Cron)

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Настройте переменные окружения:
```bash
cp env.example .env
# Отредактируйте .env файл
```

3. Настройте базу данных PostgreSQL:
```sql
-- Создайте базу данных
CREATE DATABASE bot_database;

-- Импортируйте схему (адаптированную для PostgreSQL)
-- См. schema-postgresql.sql
```

4. Запустите Redis сервер:
```bash
redis-server
```

## Запуск

### Development
```bash
npm run dev:nodejs
```

### Production
```bash
npm run start:nodejs
```

## Конфигурация

Создайте файл `.env` на основе `env.example`:

```env
BOT_TOKEN=your_bot_token
ADMIN_CHAT_ID=your_admin_chat_id
DATABASE_URL=postgresql://user:pass@localhost:5432/bot_db
REDIS_URL=redis://localhost:6379
PORT=3000
```

## API Endpoints

- `GET /` - информация о сервере
- `POST /webhook` - webhook для Telegram
- `GET /health` - проверка здоровья сервера

## Отличия от Cloudflare Worker версии

| Компонент | Cloudflare Worker | Node.js |
|-----------|-------------------|---------|
| База данных | D1 (SQLite) | PostgreSQL |
| Кэш | KV | Redis |
| HTTP сервер | fetch handler | Express |
| Cron задачи | scheduled handler | node-cron |
| Переменные | env объект | process.env |

## Миграция данных

Для переноса данных из D1 в PostgreSQL используйте скрипт миграции (если нужен).

## Мониторинг

- Логи: `console.log` в консоли
- Health check: `GET /health`
- Метрики: можно добавить Prometheus/Grafana

## Развертывание

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:nodejs"]
```

### PM2
```bash
npm install -g pm2
pm2 start src/nodejs/server.js --name telegram-bot
```

### Systemd
Создайте systemd service файл для автозапуска.
