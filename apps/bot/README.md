# 🤖 Конструктор Telegram Ботов

**Мощный конструктор для создания Telegram ботов с модульной архитектурой на Cloudflare Workers.**

Это не просто бот, а полноценный **конструктор ботов** - инструмент, который позволяет сборщикам ботов легко создавать, настраивать и развертывать собственных ботов без глубоких знаний программирования.

## 🎯 Что это такое?

**Конструктор ботов** - это платформа, которая предоставляет:

- **Готовую архитектуру** для создания ботов
- **Модульную систему** флоу (диалогов)
- **Автоматическую генерацию** кода
- **Готовые компоненты** (команды, хэндлеры, хранилища)
- **Простое развертывание** в Cloudflare

## 🏗️ Архитектура конструктора

### 📁 Структура проекта

```
/apps/bot
├── /src
│   ├── /core                         # Ядро системы
│   │   ├── flow-engine.ts            # Движок флоу
│   │   ├── message-service.ts        # Сервис сообщений
│   │   ├── user-context.ts           # Контекст пользователей
│   │   └── i18n.ts                   # Интернационализация
│   │
│   ├── /config                       # Конфигурация (настраивается сборщиком)
│   │   ├── /flows                    # Флоу бота (автогенерация)
│   │   │   ├── index.ts              # Автоматически генерируется
│   │   │   ├── start_registration.ts
│   │   │   ├── onboarding.ts
│   │   │   └── ...                   # Другие флоу
│   │   ├── commands.ts               # Команды бота
│   │   ├── callbacks.ts              # Callback кнопки
│   │   └── handlers.ts               # Хэндлеры логики
│   │
│   ├── /worker                       # Слой работы с внешними сервисами
│   │   ├── bot.ts                    # Основной контроллер
│   │   ├── d1-storage-service.ts
│   │   └── kv-storage-service.ts
│   │
│   └── /scripts                      # Инструменты сборщика
│       └── generate-flows-index.js   # Автогенерация флоу
│
├── wrangler.toml                     # Конфигурация Cloudflare
├── DEPLOYMENT.md                     # Инструкция по развертыванию
└── README.md                         # Этот файл
```

## 🎨 Как работает конструктор

### 1. **Модульная система флоу**

Сборщик создает флоу в отдельных файлах:

```typescript
// apps/bot/src/config/flows/onboarding.ts
export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Процесс регистрации',
  steps: [
    {
      type: 'message',
      id: 'welcome',
      messageKey: 'welcome_message',
      keyboardKey: 'start_button'
    },
    {
      type: 'wait_input',
      id: 'ask_name',
      prompt: 'enter_name',
      saveToVariable: 'user.name'
    }
    // ... другие шаги
  ]
};
```

### 2. **Автоматическая генерация**

Конструктор автоматически:
- **Находит все флоу** в папке `flows/`
- **Генерирует `index.ts`** с импортами
- **Подключает флоу** к движку
- **Обновляет конфигурацию** при добавлении новых флоу

```bash
npm run generate-flows-index
# ✅ Автоматически находит и подключает все флоу
```

### 3. **Готовые компоненты**

#### Команды бота (`commands.ts`)
```typescript
export const commands = [
  { name: "/start", handlerName: "handleStartCommand" },
  { name: "/menu", handlerName: "handleMenuCommand" },
  { name: "/help", handlerName: "handleHelpCommand" }
];
```

#### Callback кнопки (`callbacks.ts`)
```typescript
export const keyboards = {
  main_menu: {
    inline_keyboard: [[
      { text: "📄 Создать счет", callback_data: "create_invoice" },
      { text: "📊 Отчеты", callback_data: "reports" }
    ]]
  }
};
```

#### Хэндлеры логики (`handlers.ts`)
```typescript
export const createCustomHandlers = (worker: BotInterface) => ({
  handleStartCommand: async (message, bot) => {
    // Логика команды /start
  },
  createInvoice: async (telegramId, contextManager) => {
    // Логика создания счета
  }
});
```

## 🚀 Возможности для сборщика

### ✅ **Простое добавление флоу**
1. Создать файл `new_flow.ts` в папке `flows/`
2. Запустить `npm run generate-flows-index`
3. Флоу автоматически подключится!

### ✅ **Готовые типы шагов**
- `message` - отправка сообщения
- `wait_input` - ожидание ввода
- `handler` - выполнение логики
- `flow` - переход к другому флоу
- `dynamic` - динамический контент
- `condition` - условные переходы

### ✅ **Система переменных**
```typescript
// Сохранение данных пользователя
await contextManager.setVariable(telegramId, 'user.name', 'Иван');
await contextManager.setVariable(telegramId, 'company.pib', '123456789');

// Получение данных
const userName = await contextManager.getVariable(telegramId, 'user.name');
```

### ✅ **Интернационализация**
```typescript
// Поддержка множества языков
const message = await i18nService.getMessage('welcome_message', 'ru');
```

### ✅ **Хранилища данных**
- **D1 Database** - основная база данных
- **KV Storage** - кэш и сессии
- **R2 Storage** - файлы и документы

## 🛠️ Технический стек

- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Database**: SQLite (Cloudflare D1)
- **Cache**: Cloudflare KV
- **Files**: Cloudflare R2
- **Language**: TypeScript
- **Build**: Wrangler CLI

## 📋 Быстрый старт для сборщика

### 1. **Клонирование и настройка**
```bash
git clone <repository>
cd apps/bot
npm install
```

### 2. **Создание первого флоу**
```bash
# Создать файл flows/my_flow.ts
# Запустить автогенерацию
npm run generate-flows-index
```

### 3. **Добавление команды**
```typescript
// В commands.ts
{ name: "/my_command", handlerName: "handleMyCommand" }

// В handlers.ts
handleMyCommand: async (message, bot) => {
  // Ваша логика
}
```

### 4. **Развертывание**
```bash
npm run deploy
```

## 🎯 Преимущества конструктора

### Для сборщика ботов:
- ✅ **Быстрая разработка** - готовые компоненты
- ✅ **Модульность** - легко добавлять функции
- ✅ **Автогенерация** - минимум ручной работы
- ✅ **Готовое развертывание** - один клик
- ✅ **Масштабируемость** - легко расширять

### Для пользователей ботов:
- ✅ **Надежность** - Cloudflare инфраструктура
- ✅ **Скорость** - глобальная сеть
- ✅ **Безопасность** - изоляция и защита
- ✅ **Производительность** - оптимизированный код

## 📚 Документация

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Подробная инструкция по развертыванию
- **[Архитектура флоу](./src/core/flow-types.ts)** - Типы и интерфейсы
- **[Примеры флоу](./src/config/flows/)** - Готовые примеры

## 🤝 Вклад в развитие

Конструктор открыт для улучшений! Вы можете:
- Добавлять новые типы шагов
- Создавать готовые флоу-шаблоны
- Улучшать автогенерацию
- Расширять функциональность

---

**🎉 Создавайте своих ботов легко и быстро!**