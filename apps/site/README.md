# ALTRP Site

Frontend приложение на Next.js, развернутое на Cloudflare Pages с использованием D1 Database.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
cd apps/site
bun install
```

### Настройка Cloudflare D1

**⚠️ ВАЖНО**: Каждый разработчик должен создать свою D1 базу данных.

Следуйте инструкциям: **[D1_SETUP.md](./D1_SETUP.md)**

### Локальная разработка

```bash
# Вариант 1: Только Next.js (без Cloudflare функций)
bun run dev

# Вариант 2: С Cloudflare Workers (рекомендуется)
bun run dev:wrangler

# Вариант 3: Оба сервера одновременно
bun run dev:all
```

## 📁 Структура проекта

```
apps/site/
├── functions/          # Cloudflare Pages Functions
│   ├── api/           # API endpoints
│   │   ├── auth/      # Аутентификация
│   │   └── admin/     # Админ панель
│   └── _shared/       # Общие модули
├── src/
│   └── app/           # Next.js App Router
│       ├── (default)/ # Публичные страницы
│       ├── admin/     # Админка
│       └── login/     # Страница входа
├── wrangler.toml.example  # Шаблон конфигурации
└── D1_SETUP.md        # Инструкции по настройке D1
```

## 🗄️ База данных

- **Production**: Cloudflare D1
- **Development**: Локальная D1 (через Wrangler)
- **Миграции**: `migrations/site/`

### Команды для работы с БД

```bash
# Выполнить миграцию локально
bun run d1:migrate:local

# Выполнить миграцию на production
bun run d1:migrate:remote

# SQL запрос локально
bun run d1:query:local -- "SELECT * FROM users"

# SQL запрос на production
bun run d1:query:remote -- "SELECT * FROM users"
```

## 🔐 Первый пользователь

Смотрите инструкции: **[FIRST_USER_SETUP.md](./FIRST_USER_SETUP.md)**

## 🛠️ Доступные команды

```bash
# Разработка
bun run dev                # Next.js dev server (localhost:3100)
bun run dev:wrangler       # Cloudflare dev server (localhost:3300)
bun run dev:all           # Оба сервера одновременно

# Сборка
bun run build             # Production build
bun run build:static      # Static export

# Production
bun run start             # Запуск production сервера

# D1 Database
bun run d1:create         # Создать D1 базу
bun run d1:migrate:local  # Миграция локально
bun run d1:migrate:remote # Миграция на production

# Утилиты
bun run type-check        # Проверка типов TypeScript
bun run hash-password     # Хеширование пароля
```

## 🌐 Деплой на Cloudflare Pages

### Через CLI

```bash
# Сборка проекта
bun run build

# Деплой
wrangler pages deploy dist --project-name altrp-site
```

### Через Git (Continuous Deployment)

1. Подключите репозиторий к Cloudflare Pages
2. Установите настройки сборки:
   - **Build command**: `cd apps/site && bun install && bun run build`
   - **Build output directory**: `apps/site/dist`
   - **Root directory**: `/`

3. Настройте переменные окружения в Cloudflare Dashboard
4. Привяжите D1 базу данных к проекту

## 🔗 Связанные проекты

- [apps/app](../app/) - Payload CMS (Backend)
- [apps/bot](../bot/) - Telegram Bot
- [apps/cms](../cms/) - CMS Admin Panel

## 📚 Дополнительная документация

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Next.js](https://nextjs.org/docs)

