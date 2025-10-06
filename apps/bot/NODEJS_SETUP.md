# 🚀 Настройка Node.js версии бота

## ✅ Что было сделано

Добавлена поддержка запуска бота в Node.js окружении без изменения существующего кода:

### 📁 Новая структура
```
src/
├── core/           # ✅ Существующая бизнес-логика (не изменена)
├── config/         # ✅ Существующие конфигурации (не изменены)  
├── content/        # ✅ Существующий контент (не изменен)
├── worker/         # ✅ Существующий Cloudflare Worker код (не изменен)
├── nodejs/         # 🆕 Новая папка для Node.js реализации
│   ├── bot.ts              # Адаптированная логика бота
│   ├── storage-service.ts  # PostgreSQL + Redis адаптеры
│   ├── server.js           # Express сервер
│   └── README.md           # Документация
└── worker.ts       # ✅ Существующая точка входа Worker (не изменена)
```

### 🔧 Новые файлы конфигурации
- `tsconfig.nodejs.json` - TypeScript конфигурация для Node.js
- `env.example` - Пример переменных окружения
- Обновлен `package.json` с новыми зависимостями и скриптами

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Настройка базы данных
```bash
# Установите PostgreSQL и Redis
# Создайте базу данных и импортируйте схему
```

### 4. Запуск

#### Cloudflare Worker (как раньше):
```bash
npm run start:worker
# или
npm run dev
```

#### Node.js (новое):
```bash
npm run start:nodejs
# или для разработки
npm run dev:nodejs
```

## 📋 Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run start:worker` | Запуск Cloudflare Worker |
| `npm run start:nodejs` | Запуск Node.js сервера |
| `npm run dev:nodejs` | Запуск Node.js в режиме разработки |
| `npm run build:worker` | Сборка для Cloudflare Worker |
| `npm run build:nodejs` | Сборка для Node.js |

## 🔄 Переключение между средами

### Для разработки:
- **Cloudflare Worker**: `npm run dev`
- **Node.js**: `npm run dev:nodejs`

### Для продакшна:
- **Cloudflare Worker**: `npm run deploy`
- **Node.js**: `npm run start:nodejs`

## 🗄️ Различия в хранении данных

| Компонент | Cloudflare Worker | Node.js |
|-----------|-------------------|---------|
| Основная БД | D1 (SQLite) | PostgreSQL |
| Кэш/Сессии | KV | Redis |
| HTTP сервер | fetch handler | Express |
| Cron задачи | scheduled handler | node-cron |

## 📝 Переменные окружения

### Cloudflare Worker (wrangler.toml):
```toml
[vars]
BOT_TOKEN = "your_token"
ADMIN_CHAT_ID = "your_chat_id"
```

### Node.js (.env):
```env
BOT_TOKEN=your_token
ADMIN_CHAT_ID=your_chat_id
DATABASE_URL=postgresql://user:pass@localhost:5432/bot_db
REDIS_URL=redis://localhost:6379
PORT=3000
```

## ✅ Преимущества решения

- ✅ **Обратная совместимость** - существующий код не изменен
- ✅ **Единая бизнес-логика** - используется один core
- ✅ **Гибкость развертывания** - выбор среды по необходимости
- ✅ **Простота переключения** - одна команда для смены среды
- ✅ **Минимальные изменения** - только добавлена папка `nodejs/`

## 🎯 Что дальше?

1. **Настройте окружение** - создайте `.env` файл
2. **Установите зависимости** - `npm install`
3. **Настройте БД** - PostgreSQL + Redis
4. **Выберите среду** - Worker или Node.js
5. **Запустите бота** - соответствующей командой

Теперь у вас есть полная гибкость в выборе среды выполнения! 🎉
