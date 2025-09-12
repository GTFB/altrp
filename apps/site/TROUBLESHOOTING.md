# Устранение ошибки "Cannot read properties of undefined (reading 'custom')"

## 🚨 Проблема

Ошибка возникает из-за конфликта между NextAuth и OAuth провайдерами в middleware. OpenID Client пытается обработать конфигурацию, но не может найти нужные свойства.

## ✅ Решение

### Вариант 1: Упрощенный middleware (Рекомендуется)

Если ошибка продолжается, замените содержимое `middleware.ts` на упрощенную версию:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow root page to show language selection
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Protect admin routes - redirect to login
  // The actual admin authentication will be handled by AdminGuard component
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Check if user has a session cookie
    const sessionToken = request.cookies.get('authjs.session-token') || 
                        request.cookies.get('__Secure-authjs.session-token');
    
    if (!sessionToken) {
      // Redirect to login if no session
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If session exists, let the page/component handle admin verification
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(ru|en)/:path*', '/admin/:path*', '/api/admin/:path*']
};
```

### Вариант 2: Полное отключение middleware

Если проблема критическая, временно отключите middleware:

1. Переименуйте `middleware.ts` в `middleware.ts.backup`
2. Создайте пустой файл `middleware.ts` с содержимым:

```typescript
export const config = {
  matcher: []
};
```

### Вариант 3: Настройка переменных окружения

Убедитесь, что все переменные окружения настроены правильно:

```bash
# .env.local
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🛡️ Как работает защита без middleware

Даже без middleware, админские пути защищены:

1. **AdminGuard компонент** - проверяет права на уровне сервера
2. **API Guards** - защищают все админские API роуты
3. **Страница входа** - доступна по адресу `/login`

## 🔧 Тестирование

1. Перезапустите сервер разработки
2. Попробуйте зайти на `/admin` - должно показать страницу "Authentication Required"
3. Войдите через `/login`
4. Проверьте админские права

## 📝 Важные замечания

- Middleware - это дополнительный уровень защиты
- Основная защита работает через AdminGuard и API Guards
- Без middleware пользователи могут дойти до страницы, но не смогут увидеть контент без админских прав
