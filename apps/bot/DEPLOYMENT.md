# Инструкция по деплою Telegram бота

## 1. Установка зависимостей
```bash
npm install
```

## 2. Настройка D1 базы данных

### Создание базы данных
```bash
wrangler d1 create bot-db
```

Или если не работает:
```bash
wrangler d1 database create bot-db
```

После создания скопируйте `database_id` из вывода команды и вставьте в `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bot-db"
database_id = "ВАШ_DATABASE_ID_ЗДЕСЬ"
```

### Применение схемы базы данных
```bash
# Для локальной разработки
wrangler d1 execute bot-db --local --file=./schema.sql

# Для продакшена
wrangler d1 execute bot-db --file=./schema.sql
```

## 3. Настройка KV Namespace

### Создание KV Namespace
```bash
wrangler kv namespace create "BOT_KV"
```

Скопируйте `id` из вывода и вставьте в `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "BOT_KV"
id = "ВАШ_KV_ID_ЗДЕСЬ"
preview_id = "ВАШ_PREVIEW_KV_ID_ЗДЕСЬ"
```

## 4. Настройка секретов

Установите необходимые секреты:
```bash
# Токен бота от @BotFather
wrangler secret put BOT_TOKEN

# ID админ чата
wrangler secret put ADMIN_CHAT_ID

# Токен для API транскрипции (опционально)
wrangler secret put TRANSCRIPTION_API_TOKEN
```

## 5. Деплой

### Деплой в development
```bash
npm run deploy:dev
```

### Деплой в production
```bash
npm run deploy:prod
```

## 6. Настройка Webhook

После деплоя настройте webhook для получения обновлений от Telegram:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-worker.your-subdomain.workers.dev"}'
```

## 7. Проверка работы

Отправьте команду `/start` вашему боту в Telegram для проверки работы.
