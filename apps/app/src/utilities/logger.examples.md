# Journal Logger - Примеры использования

## Обзор

Система логирования записывает события в коллекцию `Journal` (journals).

## Структура записи в Journal

```typescript
{
  uuid: "auto-generated",           // Автоматически
  user_id: 123,                     // ID пользователя (number)
  action: "User logged in",         // Что произошло
  details: {                        // Подробности (JSON)
    level: "info",
    timestamp: "2025-10-17T...",
    environment: "development",
    // ... дополнительные данные
  },
  xaid: "some-id",                 // Внешний ID (опционально)
  created_at: "2025-10-17T..."     // Автоматически
}
```

---

## Базовое использование

### 1. Простое логирование действия

```typescript
import { log } from '@/utilities/logger'

// В любом месте, где есть payload
await log(payload, 'User registered', userId)
```

### 2. Логирование с деталями

```typescript
import { logInfo } from '@/utilities/logger'

await logInfo(payload, 'User updated profile', {
  userId: user.id,
  details: {
    fields: ['name', 'email'],
    previousEmail: 'old@example.com',
  },
})
```

---

## Уровни логирования

### Debug - Отладочная информация

```typescript
import { logDebug } from '@/utilities/logger'

await logDebug(payload, 'Processing request', {
  userId: user.id,
  details: {
    endpoint: '/api/users',
    method: 'GET',
    params: { page: 1 },
  },
})
```

### Info - Информационные сообщения

```typescript
import { logInfo } from '@/utilities/logger'

await logInfo(payload, 'User logged in successfully', {
  userId: user.id,
  details: {
    email: user.email,
    loginTime: new Date().toISOString(),
  },
})
```

### Warning - Предупреждения

```typescript
import { logWarning } from '@/utilities/logger'

await logWarning(payload, 'Storage almost full', {
  details: {
    usedSpace: '95%',
    totalSpace: '100GB',
  },
})
```

### Error - Ошибки

```typescript
import { logError } from '@/utilities/logger'

try {
  // Какой-то код
  throw new Error('Database connection failed')
} catch (error) {
  await logError(payload, 'Failed to connect to database', error as Error, {
    userId: user?.id,
    details: {
      retryAttempt: 3,
      dbHost: 'localhost',
    },
  })
}
```

### Critical - Критические ошибки

```typescript
import { logCritical } from '@/utilities/logger'

try {
  // Критическая операция
  await processPayment(orderId)
} catch (error) {
  await logCritical(payload, 'Payment processing failed', error as Error, {
    userId: user.id,
    details: {
      orderId,
      amount: 99.99,
      currency: 'USD',
    },
  })
}
```

---

## Реальные примеры

### Пример 1: Регистрация пользователя

```typescript
import { logInfo } from '@/utilities/logger'

export async function registerUser(payload: Payload, data: UserData) {
  const user = await payload.create({
    collection: 'users',
    data,
  })

  await logInfo(payload, 'User registered', {
    userId: user.id,
    details: {
      email: user.email,
      registrationMethod: 'email',
    },
  })

  return user
}
```

### Пример 2: Обновление настроек

```typescript
import { logInfo } from '@/utilities/logger'

export async function updateSettings(
  payload: Payload,
  userId: number,
  settings: Record<string, any>
) {
  await payload.update({
    collection: 'settings',
    id: settingId,
    data: settings,
  })

  await logInfo(payload, 'Settings updated', {
    userId,
    details: {
      updatedFields: Object.keys(settings),
      timestamp: new Date().toISOString(),
    },
  })
}
```

### Пример 3: Обработка ошибок API

```typescript
import { logError } from '@/utilities/logger'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  try {
    // Ваша логика API
    const result = await doSomething()
    return Response.json({ success: true, result })
  } catch (error) {
    await logError(payload, 'API request failed', error as Error, {
      userId: user?.id,
      details: {
        endpoint: request.url,
        method: request.method,
      },
    })

    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Пример 4: Seed endpoint (текущее использование)

```typescript
import { logInfo } from '@/utilities/logger'

export const seed = async ({ payload, req }) => {
  const userId = req.user?.id

  await logInfo(payload, 'Seed endpoint started', {
    userId,
    details: {
      userEmail: req.user?.email,
      note: 'No operations performed',
    },
  })

  // ... логика seed

  await logInfo(payload, 'Seed completed successfully', {
    userId,
    details: {
      changes: 'none',
    },
  })
}
```

---

## Просмотр логов

### В админ-панели

1. Перейдите в админ-панель: `/admin`
2. Откройте раздел **Journals**
3. Фильтруйте и просматривайте записи

### Через API

```bash
# Получить все логи
GET /api/journals

# Получить логи конкретного пользователя
GET /api/journals?where[user_id][equals]=123

# Получить логи с определённым action
GET /api/journals?where[action][contains]=seed
```

---

## Советы

### ✅ Хорошие практики

- **Логируйте важные действия**: регистрация, вход, изменение данных
- **Добавляйте контекст**: userId, email, timestamp
- **Используйте правильный уровень**: info для обычных действий, error для ошибок
- **Структурируйте details**: используйте понятные ключи

### ❌ Избегайте

- **Не логируйте пароли** или чувствительные данные
- **Не логируйте в циклах** без необходимости
- **Не дублируйте информацию** - created_at и timestamp добавляются автоматически

---

## Производительность

Логирование происходит асинхронно и не блокирует основной поток:

```typescript
// ✅ Хорошо - логирование не блокирует ответ
await doSomething()
logInfo(payload, 'Action completed')  // Fire and forget
return Response.json({ success: true })

// ✅ Ещё лучше - явное ожидание
await doSomething()
await logInfo(payload, 'Action completed')
return Response.json({ success: true })
```

Если логирование в БД не удалось, ошибка записывается только в консоль и не прерывает выполнение.

