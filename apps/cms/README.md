# Jambo CMS

Payload CMS приложение для управления контентом сайта Jambo.

## Настройка

### 1. Установка зависимостей

```bash
bun install
```

### 2. Настройка базы данных PostgreSQL

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE jambo_cms;
```

### 3. Настройка переменных окружения

Скопируйте файл `env.example` в `.env` и настройте переменные:

```bash
cp env.example .env
```

Обновите следующие переменные в `.env`:

```env
PAYLOAD_SECRET=your-very-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/jambo_cms
```

### 4. Запуск в режиме разработки

```bash
bun run dev
```

Админ-панель будет доступна по адресу: http://localhost:3001/admin

### 5. Генерация типов TypeScript

```bash
bun run generate:types
```

## Доступные коллекции

- **Users** - Пользователи системы с ролями (admin, editor, user)
- **Posts** - Статьи блога с поддержкой категорий и тегов
- **Categories** - Категории для статей
- **Media** - Файлы и изображения
- **Pages** - Статические страницы сайта

## Скрипты

- `bun run dev` - Запуск в режиме разработки
- `bun run build` - Сборка для продакшена
- `bun run start` - Запуск продакшен версии
- `bun run generate:types` - Генерация TypeScript типов
- `bun run migrate` - Выполнение миграций базы данных

## Интеграция с фронтендом

Для интеграции с фронтенд приложением используйте Payload REST API или GraphQL API:

- REST API: `http://localhost:3001/api/{collection}`
- GraphQL: `http://localhost:3001/api/graphql`

Пример получения постов:

```typescript
const posts = await fetch('http://localhost:3001/api/posts').then(res => res.json())
```
