# 🚀 Инструкция по развертыванию Telegram бота в Cloudflare

## 📋 Предварительные требования

1. **Node.js** (версия 18 или выше)
2. **npm** или **yarn**
3. **Wrangler CLI** - установить глобально:
   ```bash
   npm install -g wrangler
   ```
4. **Аккаунт Cloudflare** с доступом к Workers
5. **Telegram Bot Token** от @BotFather

## Необходимо создать файл wrangler.toml
## Для этого можно скопировать wrangler.toml.example

## Авторизоваться в cloudflare

```
npx wrangler login
```


## 🔧 Шаг 1: Настройка wrangler.toml

### 1.1 Заполните конфигурацию
Откройте файл `wrangler.toml` и замените плейсхолдеры:

```toml
name = "YOUR_WORKER_NAME"           # ← Замените на имя вашего бота
```

**Пример:**
```toml
name = "my-telegram-bot"
```

### 1.2 Получите Account ID
```bash
npx wrangler whoami
```
Скопируйте `Account ID` из вывода команды.

```
account_id = "YOUR_ACCOUNT_ID_HERE" # ← Вставьте ваш Account ID
```

**Пример:**
```toml
account_id = "1234567890qwertyuioasdfghzxcvbn4"

```

### 1.3 Настройте окружения (опционально)
```toml
[env.development]
name = "YOUR_WORKER_NAME-dev"       # ← Для разработки

[env.production]
name = "YOUR_WORKER_NAME-prod"      # ← Для продакшена
```

## 🗄️ Шаг 2: Создание базы данных D1

### 2.1 Создайте базу данных
```bash
npx wrangler d1 create YOUR_DATABASE_NAME
```

**Пример:**
```bash
npx wrangler d1 create my-bot-db
```

### 2.2 Обновите wrangler.toml
После создания скопируйте `database_id` и раскомментируйте секцию:

```toml
[[d1_databases]]
binding = "DB"
database_name = "YOUR_DATABASE_NAME"   # ← Вставьте название из предыдущего шага
database_id = "YOUR_DATABASE_ID_HERE"  # ← Вставьте ID из предыдущего шага
```

### 2.3 Примените схему базы данных
```bash
# Для локальной разработки
wrangler d1 execute YOUR_DATABASE_NAME --local --file=./schema.sql

# Для продакшена
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=./schema.sql
```

## 💾 Шаг 3: Создание KV Namespace

### 3.1 Создайте KV namespace
```bash
wrangler kv namespace create "BOT_KV"
```

### 3.2 Обновите wrangler.toml
Скопируйте `id` и `preview_id` из вывода команды:

```toml
[[kv_namespaces]]
binding = "BOT_KV"
id = "YOUR_KV_ID_HERE"              # ← Production ID
preview_id = "YOUR_PREVIEW_KV_ID_HERE" # ← Preview ID
```

## 🔐 Шаг 4: Настройка секретов

Установите необходимые секреты для бота:

```bash
# Токен бота от @BotFather
wrangler secret put BOT_TOKEN

# ID админского чата (где бот будет отправлять уведомления)
wrangler secret put ADMIN_CHAT_ID

# Токен для API транскрипции (опционально)
wrangler secret put TRANSCRIPTION_API_TOKEN
```

**Как получить ADMIN_CHAT_ID:**
1. Добавьте бота в группу/канал
2. Отправьте сообщение в группу
3. Перейдите по ссылке: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Найдите `chat.id` в ответе

## 📦 Шаг 5: Установка зависимостей

```bash
npm install --ignore-scripts
```

## 🚀 Шаг 6: Развертывание

### 6.1 Развертывание в development
```bash
npm run deploy:dev
# или
wrangler deploy --env development
```

### 6.2 Развертывание в production
```bash
npm run deploy
# или
wrangler deploy --env production
```

## 🔗 Шаг 7: Настройка Webhook

После успешного развертывания настройте webhook для получения обновлений от Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev"}'
```

**Замените:**
- `<YOUR_BOT_TOKEN>` - на токен вашего бота
- `YOUR_WORKER_NAME` - на имя вашего воркера
- `YOUR_SUBDOMAIN` - на ваш поддомен Cloudflare

## ✅ Шаг 8: Проверка работы

1. Отправьте команду `/start` вашему боту в Telegram
2. Проверьте логи воркера:
   ```bash
   wrangler tail --format pretty
   ```

## 🛠️ Полезные команды

### Просмотр логов
```bash
wrangler tail --format pretty
```

### Выполнение SQL запросов
```bash
wrangler d1 execute YOUR_DATABASE_NAME --command "SELECT * FROM users"
```

### Локальная разработка
```bash
wrangler dev
```

### Просмотр секретов
```bash
wrangler secret list
```

## 🚨 Устранение неполадок

### Ошибка "Account ID not found"
- Убедитесь, что вы авторизованы: `wrangler login`
- Проверьте правильность Account ID в `wrangler.toml`

### Ошибка "Database not found"
- Убедитесь, что база данных создана: `wrangler d1 list`
- Проверьте правильность `database_id` в `wrangler.toml`

### Бот не отвечает
- Проверьте настройку webhook
- Убедитесь, что все секреты установлены: `wrangler secret list`
- Проверьте логи: `wrangler tail`

## 📚 Дополнительные ресурсы

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**Готово!** 🎉 Ваш Telegram бот теперь работает в Cloudflare Workers!
