# Telegram Bot

Telegram бот с модульной архитектурой, построенный на Cloudflare Workers.

## 🏗️ Архитектура проекта

Проект организован по принципу разделения ответственности с четким разграничением слоев:

```
/src
  /core                          # Основные сервисы бизнес-логики
    ├── message-service.ts       # Сервис отправки и логирования сообщений
    ├── topic-service.ts         # Сервис управления топиками Telegram
    └── helpers.ts              # Вспомогательные функции (isVKLink, etc.)
  
  /worker                        # Слой работы с внешними сервисами
    ├── bot.ts                   # Основная логика бота и обработка обновлений
    ├── d1-storage-service.ts    # Работа с базой данных D1
    └── kv-storage-service.ts    # Работа с хранилищем KV

/                               # Корневые файлы
├── schema.sql                  # Схема базы данных
├── wrangler.toml              # Конфигурация Cloudflare Workers
└── package.json               # Зависимости проекта
```

## 📋 Описание компонентов

### Core Services

#### 🔄 MessageService (`/src/core/message-service.ts`)
Централизованный сервис для работы с сообщениями Telegram:

- **Отправка сообщений**: текст, фото, голос, документы
- **Клавиатуры**: inline keyboard с callback кнопками
- **Логирование**: все входящие и исходящие сообщения в БД
- **Callback Query**: обработка нажатий на кнопки
- **Отправка в топики**: сообщения в админскую группу

**Ключевые методы:**
- `sendMessage()`, `sendMessageWithKeyboard()`
- `sendPhotoToUser()`, `sendVoiceToUser()`, `sendDocumentToUser()`
- `logMessage()`, `logCallbackQuery()`
- `handleCallbackQuery()`

#### 🏷️ TopicService (`/src/core/topic-service.ts`)
Сервис управления топиками в Telegram форумах:

- **Создание топиков**: автоматическое создание для новых пользователей
- **Пересылка сообщений**: из топиков пользователям и обратно
- **Обработка файлов**: пересылка медиафайлов в топики
- **Маршрутизация**: связь между пользователем и его топиком

**Ключевые методы:**
- `createTopicInAdminGroup()`
- `forwardMessageToUser()`, `forwardMessageToUserTopic()`
- `handleMessageFromTopic()`
- `forwardFileToTopic()`

#### 🛠️ Helpers (`/src/core/helpers.ts`)
Вспомогательные утилиты:

- `isVKLink()`: проверка ссылок VK
- Другие переиспользуемые функции

### Worker Layer

#### 🤖 TelegramBotWorker (`/src/worker/bot.ts`)
Основной контроллер бота:

- **Обработка обновлений**: webhook от Telegram
- **Команды**: `/start`, `/help`, `/confirmed`, `/not_confirmed`
- **Бизнес-логика**: регистрация пользователей, проверка подписок
- **Cron задачи**: отложенные сообщения
- **Валидация**: проверка VK ссылок, подписок

#### 🗄️ D1StorageService (`/src/worker/d1-storage-service.ts`)
Слой доступа к данным (SQLite D1):

- **Пользователи**: CRUD операции с таблицей `users`
- **Сообщения**: логирование в таблицу `messages`
- **Связи**: топики пользователей, данные JSON
- **Миграции**: инициализация таблиц

**Основные таблицы:**
- `users`: пользователи с Telegram ID и метаданными
- `messages`: все сообщения бота (входящие/исходящие)
- `companies`, `company_users`: бизнес-сущности

#### 💾 KVStorageService (`/src/worker/kv-storage-service.ts`)
Кэширование и временные данные:

- **Сессии**: временные состояния пользователей
- **Кэш**: быстрый доступ к часто используемым данным
- **TTL**: автоматическое удаление устаревших данных

## 🔄 Поток данных

```
Telegram API → TelegramBotWorker → Core Services → Storage Services
                      ↑                              ↓
              Response ←── Business Logic ←── Database/KV
```

1. **Входящие обновления** поступают в `TelegramBotWorker`
2. **Бизнес-логика** определяет тип обработки
3. **Core Services** выполняют специализированные операции
4. **Storage Services** обеспечивают персистентность данных
5. **Ответы** отправляются через Telegram API

## 🛡️ Принципы архитектуры

### Single Responsibility Principle
Каждый сервис отвечает за свою область:
- `MessageService` → сообщения и логирование
- `TopicService` → топики и пересылка
- `D1StorageService` → база данных
- `TelegramBotWorker` → координация и бизнес-логика

### Dependency Injection
Сервисы внедряются через конструкторы:
```typescript
constructor(env: Env, kvStorage: KVStorageService) {
  this.messageService = new MessageService({...});
  this.topicService = new TopicService({...});
}
```

### Interface Segregation
Четкие контракты между слоями через TypeScript интерфейсы.

## 🚀 Развертывание

```bash
# Установка зависимостей
npm install

# Настройка базы данных
wrangler d1 execute bzn-bot-db --file=schema.sql

# Развертывание
wrangler deploy
```

## 📊 Мониторинг

```bash
# Просмотр логов в реальном времени
wrangler tail --format pretty

# Выполнение SQL запросов
wrangler d1 execute bzn-bot-db --command "SELECT * FROM users"
```

## 🔧 Технические детали

- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Database**: SQLite (Cloudflare D1)
- **Cache**: Cloudflare KV
- **Language**: TypeScript
- **Build**: Wrangler CLI

## 📈 Преимущества архитектуры

- ✅ **Модульность**: легко добавлять новые сервисы
- ✅ **Тестируемость**: изолированные компоненты
- ✅ **Переиспользование**: сервисы можно использовать в разных контекстах
- ✅ **Масштабируемость**: четкое разделение ответственности
- ✅ **Читаемость**: понятная структура проекта
- ✅ **Поддержка**: простота внесения изменений

---

*Архитектура спроектирована для надежной и эффективной работы Telegram бота с возможностью легкого расширения функциональности.*
