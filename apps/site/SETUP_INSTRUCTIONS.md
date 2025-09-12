# Инструкции по настройке админской защиты

## 🚨 Важно: Настройка переменных окружения

Перед использованием админских функций необходимо настроить переменные окружения:

### 1. Создайте файл `.env.local` в папке `apps/site/`

```bash
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (опционально)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 2. Генерация NEXTAUTH_SECRET

Выполните команду для генерации секретного ключа:

```bash
openssl rand -base64 32
```

Или используйте онлайн генератор: https://generate-secret.vercel.app/32

### 3. Настройка OAuth провайдеров

#### Google OAuth:
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth:
1. Перейдите в [GitHub Developer Settings](https://github.com/settings/developers)
2. Создайте новое OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Настройка админских пользователей

В файле `apps/site/lib/auth-server.ts` обновите список админских email:

```typescript
const ADMIN_EMAILS = [
  'your-admin-email@gmail.com',
  'another-admin@example.com',
  // Добавьте другие админские email
];
```

Также обновите список в `apps/site/middleware.ts`:

```typescript
const adminEmails = ['your-admin-email@gmail.com', 'another-admin@example.com'];
```

## 🛡️ Как работает защита

1. **Middleware** - первая линия защиты, перехватывает запросы к админским путям
2. **AdminGuard** - компонент для защиты страниц, проверяет права на уровне сервера
3. **API Guards** - защита API роутов, автоматическая проверка перед выполнением

## 🔧 Тестирование

1. Убедитесь, что все переменные окружения настроены
2. Перезапустите сервер разработки
3. Попробуйте зайти на `/admin` без авторизации - должно перенаправить на `/login`
4. Войдите с обычным пользователем - админские страницы должны быть недоступны
5. Войдите с админским email - админские страницы должны быть доступны

## 🚀 Готово!

После выполнения всех шагов админские пути будут полностью защищены и доступны только авторизованным администраторам.
