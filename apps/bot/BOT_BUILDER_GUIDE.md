# 🛠️ Руководство по сборке ботов

**Пошаговая инструкция по созданию Telegram ботов с помощью нашего конструктора**

## 📋 Содержание

1. [Быстрый старт](#-быстрый-старт)
2. [Структура проекта](#-структура-проекта)
3. [Создание команд](#-создание-команд)
4. [Создание флоу](#-создание-флоу)
5. [Создание кнопок](#-создание-кнопок)
6. [Создание хэндлеров](#-создание-хэндлеров)
7. [Система сообщений](#-система-сообщений)
8. [Продвинутые техники](#-продвинутые-техники)
9. [Развертывание](#-развертывание)

## 🚀 Быстрый старт

### 1. Подготовка проекта
```bash
# Клонирование и установка
git clone <repository>
cd apps/bot
npm install

# Настройка конфигурации
cp wrangler.toml.example wrangler.toml
# Отредактируйте wrangler.toml с вашими данными
```

### 2. Создание первого бота
```bash
# 1. Создайте команду
# 2. Создайте флоу
# 3. Создайте хэндлеры
# 4. Запустите автогенерацию
npm run generate-flows-index

# 5. Разверните бота
npm run deploy
```

## 📁 Структура проекта

```
/apps/bot/src/config/
├── commands.ts          # Команды бота (/start, /help, etc.)
├── callbacks.ts         # Кнопки и клавиатуры
├── handlers.ts          # Бизнес-логика и хэндлеры
└── flows/              # Флоу (диалоги) бота
    ├── index.ts        # Автогенерируется
    ├── start_registration.ts
    ├── onboarding.ts
    └── ...
```

## 🎯 Создание команд

### 1. Добавление команды в `commands.ts`

```typescript
// apps/bot/src/config/commands.ts
export const commands: BotCommand[] = [
  {
    name: "/start",
    handlerName: "handleStartCommandFlow",
    description: "Start working with bot"
  },
  {
    name: "/my_command",        // ← Новая команда
    handlerName: "handleMyCommand",
    description: "My custom command"
  }
];
```

### 2. Создание хэндлера команды в `handlers.ts`

```typescript
// apps/bot/src/config/handlers.ts
export const createCustomHandlers = (worker: BotInterface) => ({
  // ... существующие хэндлеры

  // Новый хэндлер команды
  handleMyCommand: async (message: any, bot: any) => {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`🚀 Handling /my_command for user ${userId}`);
    
    // Ваша логика здесь
    await bot.flowEngine.startFlow(userId, 'my_flow');
  }
});
```

## 🔄 Создание флоу

### 1. Создание файла флоу

Создайте файл `apps/bot/src/config/flows/my_flow.ts`:

```typescript
import type { BotFlow } from '../../core/flow-types';

export const myFlow: BotFlow = {
  name: 'my_flow',
  description: 'My custom flow',
  steps: [
    {
      type: 'message',
      id: 'welcome',
      messageKey: 'welcome_message',
      keyboardKey: 'main_menu'
    },
    {
      type: 'wait_input',
      id: 'ask_name',
      prompt: 'enter_name',
      saveToVariable: 'user.name',
      nextStep: 'ask_email'
    },
    {
      type: 'wait_input',
      id: 'ask_email',
      prompt: 'enter_email',
      saveToVariable: 'user.email',
      nextStep: 'process_data'
    },
    {
      type: 'handler',
      id: 'process_data',
      handlerName: 'processUserData',
      nextStep: 'show_result'
    },
    {
      type: 'message',
      id: 'show_result',
      messageKey: 'registration_complete',
      nextStep: ''
    }
  ]
};
```

### 2. Типы шагов флоу

#### `message` - Отправка сообщения
```typescript
{
  type: 'message',
  id: 'step_id',
  messageKey: 'message_key',        // Ключ сообщения из i18n
  keyboardKey: 'keyboard_key',      // Ключ клавиатуры (опционально)
  nextStep: 'next_step_id'          // Следующий шаг (опционально)
}
```

#### `wait_input` - Ожидание ввода
```typescript
{
  type: 'wait_input',
  id: 'step_id',
  prompt: 'enter_prompt',           // Ключ сообщения-подсказки
  saveToVariable: 'user.name',      // Переменная для сохранения
  validation: {                     // Валидация (опционально)
    type: 'email',
    errorMessage: 'invalid_email'
  },
  nextStep: 'next_step_id'
}
```

#### `handler` - Выполнение хэндлера
```typescript
{
  type: 'handler',
  id: 'step_id',
  handlerName: 'handlerName',       // Имя хэндлера из handlers.ts
  nextStep: 'next_step_id'
}
```

#### `flow` - Переход к другому флоу
```typescript
{
  type: 'flow',
  id: 'step_id',
  flowName: 'other_flow_name'
}
```

#### `dynamic` - Динамический контент
```typescript
{
  type: 'dynamic',
  id: 'step_id',
  handler: 'generateDynamicContent', // Хэндлер для генерации
  keyboardKey: 'dynamic_keyboard',  // Клавиатура (опционально)
  nextStep: 'next_step_id'
}
```

### 3. Автогенерация флоу

После создания флоу запустите автогенерацию:

```bash
npm run generate-flows-index
```

Это автоматически:
- Найдет все флоу в папке `flows/`
- Сгенерирует `index.ts` с импортами
- Подключит флоу к системе

## 🔘 Создание кнопок

### 1. Статические кнопки в `callbacks.ts`

```typescript
// apps/bot/src/config/callbacks.ts
export const keyboards = {
  main_menu: {
    inline_keyboard: [
      [
        { text: "📄 Создать счет", callback_data: "create_invoice" },
        { text: "📊 Отчеты", callback_data: "reports" }
      ],
      [
        { text: "👤 Профиль", callback_data: "profile" },
        { text: "⚙️ Настройки", callback_data: "settings" }
      ]
    ]
  },

  language_selection: {
    inline_keyboard: [
      [
        { text: "🇷🇸 Srpski", callback_data: "lang_select_sr" },
        { text: "🇷🇺 Русский", callback_data: "lang_select_ru" }
      ]
    ]
  }
};
```

### 2. Обработка нажатий кнопок

```typescript
// apps/bot/src/config/callbacks.ts
export const callbackActions = {
  // Обработка выбора языка
  'lang_select_sr': {
    action: 'set_variable',
    variable: 'user.language',
    value: 'sr',
    nextFlow: 'onboarding'
  },
  'lang_select_ru': {
    action: 'set_variable',
    variable: 'user.language',
    value: 'ru',
    nextFlow: 'onboarding'
  },

  // Запуск флоу
  'create_invoice': {
    action: 'start_flow',
    flowName: 'create_invoice'
  },

  // Переход к шагу
  'go_to_profile': {
    action: 'go_to_step',
    stepId: 'show_profile'
  }
};
```

## ⚙️ Создание хэндлеров

### 1. Хэндлеры команд

```typescript
// apps/bot/src/config/handlers.ts
export const createCustomHandlers = (worker: BotInterface) => ({
  // Хэндлер команды
  handleMyCommand: async (message: any, bot: any) => {
    const userId = message.from.id;
    // Логика команды
  },

  // Хэндлер для шага флоу
  processUserData: async (telegramId: number, contextManager: UserContextManager) => {
    const userName = await contextManager.getVariable(telegramId, 'user.name');
    const userEmail = await contextManager.getVariable(telegramId, 'user.email');
    
    // Обработка данных
    console.log(`Processing user: ${userName}, email: ${userEmail}`);
    
    // Сохранение в БД
    await worker.d1Storage.addUser({
      name: userName,
      email: userEmail,
      // ... другие поля
    });
  },

  // Динамический хэндлер
  generateDynamicContent: async (telegramId: number, contextManager: UserContextManager) => {
    // Получение данных из БД
    const data = await worker.d1Storage.getSomeData();
    
    // Генерация сообщения
    return `Данные: ${JSON.stringify(data)}`;
  }
});
```

### 2. Доступные сервисы в хэндлерах

```typescript
// В хэндлере доступны:
const handlerWorker = {
  d1Storage: worker['d1Storage'],        // База данных
  flowEngine: worker['flowEngine'],      // Движок флоу
  env: worker['env'],                    // Переменные окружения
  messageService: worker['messageService'], // Отправка сообщений
  topicService: worker['topicService']   // Топики Telegram
};

// Примеры использования:
await handlerWorker.d1Storage.getUser(telegramId);
await handlerWorker.messageService.sendMessage(telegramId, 'Hello!');
await contextManager.setVariable(telegramId, 'key', 'value');
```

## 💬 Система сообщений

### 1. Ключи сообщений

Создайте файл с сообщениями (например, в `src/core/messages.ts`):

```typescript
export const messages = {
  welcome_message: {
    ru: 'Добро пожаловать! 👋',
    sr: 'Dobrodošli! 👋'
  },
  enter_name: {
    ru: 'Введите ваше имя:',
    sr: 'Unesite vaše ime:'
  },
  enter_email: {
    ru: 'Введите email:',
    sr: 'Unesite email:'
  }
};
```

### 2. Использование в флоу

```typescript
{
  type: 'message',
  id: 'welcome',
  messageKey: 'welcome_message',  // Ключ из messages
  keyboardKey: 'main_menu'
}
```

## 🚀 Продвинутые техники

### 1. Условные переходы

```typescript
{
  type: 'condition',
  id: 'check_user_type',
  condition: 'user.type === "premium"',
  trueFlow: 'premium_flow',
  falseFlow: 'basic_flow'
}
```

### 2. Динамические кнопки

```typescript
// В хэндлере
generateCourseButtons: async (telegramId, contextManager) => {
  const courses = await worker.d1Storage.getCourses();
  
  const buttons = courses.map(course => ({
    text: course.name,
    callback_data: JSON.stringify({
      type: 'course_select',
      courseId: course.id,
      stepId: 'select_course'
    })
  }));
  
  return {
    message: 'Выберите курс:',
    keyboard: { inline_keyboard: [buttons] }
  };
}
```

### 3. Валидация ввода

```typescript
{
  type: 'wait_input',
  id: 'ask_email',
  prompt: 'enter_email',
  saveToVariable: 'user.email',
  validation: {
    type: 'email',
    errorMessage: 'invalid_email_format'
  },
  nextStep: 'next_step'
}
```

### 4. Работа с файлами

```typescript
// В хэндлере
handleFileUpload: async (telegramId, contextManager) => {
  const file = await contextManager.getVariable(telegramId, '_system.currentFile');
  
  // Сохранение в R2
  await worker.env.BOT_STORAGE.put(`users/${telegramId}/file.pdf`, file);
  
  // Создание публичной ссылки
  const publicUrl = `https://pub-${bucketId}.r2.dev/users/${telegramId}/file.pdf`;
}
```

## 🔧 Развертывание

### 1. Настройка wrangler.toml

```toml
name = "my-bot"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "my-bot-db"
database_id = "your-database-id"

# R2 Storage (опционально)
[[r2_buckets]]
binding = "BOT_STORAGE"
bucket_name = "my-bot-storage"
```

### 2. Установка секретов

```bash
# Токен бота
wrangler secret put BOT_TOKEN

# ID админского чата
wrangler secret put ADMIN_CHAT_ID
```

### 3. Развертывание

```bash
# Генерация флоу
npm run generate-flows-index

# Развертывание
npm run deploy
```

### 4. Настройка webhook

```bash
# После развертывания
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-worker.your-subdomain.workers.dev"}'
```

## 📚 Примеры готовых ботов

### 1. Бот-опросник
- Флоу: `questionnaire.ts`
- Команды: `/start`, `/restart`
- Кнопки: выбор вариантов ответов

### 2. Бот-каталог
- Флоу: `catalog.ts`, `product_details.ts`
- Команды: `/catalog`, `/search`
- Динамические кнопки: товары из БД

### 3. Бот-заказ
- Флоу: `order.ts`, `payment.ts`
- Команды: `/order`, `/status`
- Интеграция с платежными системами

## 🎯 Лучшие практики

### 1. Структура флоу
- ✅ Один флоу = одна задача
- ✅ Понятные ID шагов
- ✅ Обработка ошибок
- ✅ Валидация ввода

### 2. Именование
- ✅ Команды: `/action_name`
- ✅ Флоу: `action_name`
- ✅ Хэндлеры: `handleActionName`
- ✅ Переменные: `category.subcategory`

### 3. Обработка ошибок
```typescript
try {
  await processData();
} catch (error) {
  console.error('Error:', error);
  await contextManager.setVariable(telegramId, 'error', error.message);
  await flowEngine.goToStep(telegramId, 'error_handler');
}
```

---

**🎉 Готово! Теперь вы можете создавать мощных Telegram ботов с помощью нашего конструктора!**

Для получения помощи обращайтесь к:
- [README.md](./README.md) - общая информация
- [DEPLOYMENT.md](./DEPLOYMENT.md) - развертывание
- [Примеры флоу](./src/config/flows/) - готовые примеры
