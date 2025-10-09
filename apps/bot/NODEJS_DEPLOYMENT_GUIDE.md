# 🚀 Руководство по развертыванию Node.js версии бота

## ✅ Статус готовности

Бот готов к развертыванию в Node.js среде! Все компоненты протестированы и работают корректно.

## 📋 Что было проверено

- ✅ **Зависимости**: Все npm пакеты установлены корректно
- ✅ **Сборка**: TypeScript компилируется без ошибок
- ✅ **Импорты**: Все модули импортируются корректно
- ✅ **Схема БД**: PostgreSQL схема создана (`schema-postgresql.sql`)
- ✅ **Конфигурация**: Переменные окружения настроены
- ✅ **Тестирование**: Базовый тест запуска прошел успешно

## 🛠️ Пошаговая инструкция развертывания

### 1. Подготовка окружения

```bash
# Перейдите в папку бота
cd apps/bot

# Установите зависимости (если еще не установлены)
npm install
```

### 2. Настройка базы данных PostgreSQL

```bash
# Создайте базу данных
createdb bot_database

# Импортируйте схему
psql -d bot_database -f schema-postgresql.sql
```

### 3. Настройка Redis

```bash
# Установите и запустите Redis
# Ubuntu/Debian:
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS:
brew install redis
brew services start redis

# Windows:
# Скачайте Redis for Windows и запустите redis-server.exe
```

### 4. Создание конфигурации

```bash
# Скопируйте пример конфигурации
cp env.example .env

# Отредактируйте .env файл с вашими настройками
nano .env
```

Пример `.env` файла:
```env
# Telegram Bot Configuration
BOT_TOKEN=your_actual_bot_token_here
ADMIN_CHAT_ID=your_admin_chat_id_here
TRANSCRIPTION_API_TOKEN=your_transcription_token_here

# Environment
NODE_ENV=production
LOCALE=ru

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/bot_database

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3000
```

### 5. Генерация контента

```bash
# Сгенерируйте файл с переводами
npm run generate:content:nodejs
```

### 6. Сборка проекта

```bash
# Соберите TypeScript код
npm run build:nodejs
```

### 7. Запуск бота

#### Для разработки:
```bash
npm run dev:nodejs
```

#### Для продакшна:
```bash
npm run start:nodejs
```

## 🔧 Проверка работы

### 1. Health Check
```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Информация о сервере
```bash
curl http://localhost:3000/
```

Ожидаемый ответ:
```json
{
  "message": "Telegram Bot Node.js Server",
  "version": "1.0.0",
  "endpoints": {
    "webhook": "/webhook",
    "health": "/health"
  }
}
```

### 3. Настройка Webhook

После запуска бота настройте webhook в Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/webhook"}'
```

## 🐳 Docker развертывание

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build:nodejs

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "start:nodejs"]
```

Docker Compose (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - ADMIN_CHAT_ID=${ADMIN_CHAT_ID}
      - DATABASE_URL=postgresql://postgres:password@db:5432/bot_database
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=bot_database
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema-postgresql.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

Запуск:
```bash
docker-compose up -d
```

## 📊 Мониторинг

### Логи
Логи выводятся в консоль. Для продакшна рекомендуется настроить логирование в файлы:

```bash
# Запуск с логированием в файл
npm run start:nodejs > bot.log 2>&1 &
```

### PM2 (рекомендуется для продакшна)

```bash
# Установите PM2
npm install -g pm2

# Создайте ecosystem файл
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'dist-nodejs/nodejs/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Запустите с PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔍 Устранение неполадок

### Проблема: "Cannot connect to PostgreSQL"
```bash
# Проверьте, что PostgreSQL запущен
sudo systemctl status postgresql

# Проверьте подключение
psql -d bot_database -c "SELECT 1;"
```

### Проблема: "Cannot connect to Redis"
```bash
# Проверьте, что Redis запущен
redis-cli ping
# Должен вернуть PONG
```

### Проблема: "Module not found"
```bash
# Пересоберите проект
npm run build:nodejs
```

### Проблема: "Port already in use"
```bash
# Найдите процесс, использующий порт
lsof -i :3000

# Убейте процесс
kill -9 <PID>
```

## 📈 Производительность

### Рекомендуемые настройки для продакшна:

1. **PostgreSQL**:
   - Настройте connection pooling
   - Добавьте индексы для часто используемых запросов
   - Настройте мониторинг

2. **Redis**:
   - Настройте persistence (RDB + AOF)
   - Настройте мониторинг памяти
   - Рассмотрите Redis Cluster для высокой нагрузки

3. **Node.js**:
   - Используйте PM2 для управления процессами
   - Настройте мониторинг (например, New Relic, DataDog)
   - Рассмотрите использование кластера для CPU-intensive задач

## 🎉 Готово!

Ваш бот готов к работе в Node.js среде! Все компоненты протестированы и настроены корректно.

Для получения поддержки или сообщения об ошибках, обратитесь к документации проекта или создайте issue в репозитории.
