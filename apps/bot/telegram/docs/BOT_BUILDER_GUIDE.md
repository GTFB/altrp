# 🛠️ Bot Builder Guide

**Step-by-step guide for creating Telegram bots with our builder**

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Structure](#-project-structure)
3. [Creating Commands](#-creating-commands)
4. [Creating Flows](#-creating-flows)
5. [Creating Buttons](#-creating-buttons)
6. [Creating Handlers](#-creating-handlers)
7. [Message System](#-message-system)
8. [Advanced Techniques](#-advanced-techniques)
9. [Deployment](#-deployment)

## 🚀 Quick Start

### 1. Project Setup
```bash
# Clone and install
git clone <repository>
cd apps/bot
npm install

# Configure settings
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your data
```

### 2. Create Your First Bot
```bash
# 1. Create a command
# 2. Create a flow
# 3. Create handlers
# 4. Run autogeneration
npm run generate-flows-index

# 5. Deploy the bot
npm run deploy
```

## 📁 Project Structure

```
/apps/bot/src/config/
├── commands.ts          # Bot commands (/start, /help, etc.)
├── callbacks.ts         # Buttons and keyboards
├── handlers.ts          # Business logic and handlers
└── flows/              # Bot flows (dialogs)
    ├── index.ts        # Auto-generated
    ├── start_registration.ts
    ├── onboarding.ts
    └── ...
```

## 🎯 Creating Commands

### 1. Adding a command in `commands.ts`

```typescript
// apps/bot/src/config/commands.ts
export const commands: BotCommand[] = [
  {
    name: "/start",
    handlerName: "handleStartCommandFlow",
    description: "Start working with bot"
  },
  {
    name: "/my_command",        // ← New command
    handlerName: "handleMyCommand",
    description: "My custom command"
  }
];
```

### 2. Creating a command handler in `handlers.ts`

```typescript
// apps/bot/src/config/handlers.ts
export const createCustomHandlers = (worker: BotInterface) => ({
  // ... existing handlers

  // New command handler
  handleMyCommand: async (message: any, bot: any) => {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`🚀 Handling /my_command for user ${userId}`);
    
    // Your logic here
    await bot.flowEngine.startFlow(userId, 'my_flow');
  }
});
```

## 🔄 Creating Flows

### 1. Creating a flow file

Create file `apps/bot/src/config/flows/my_flow.ts`:

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

### 2. Flow step types

#### `message` - Send message
```typescript
{
  type: 'message',
  id: 'step_id',
  messageKey: 'message_key',        // Message key from i18n
  keyboardKey: 'keyboard_key',      // Keyboard key (optional)
  nextStep: 'next_step_id'          // Next step (optional)
}
```

#### `wait_input` - Wait for input
```typescript
{
  type: 'wait_input',
  id: 'step_id',
  prompt: 'enter_prompt',           // Prompt message key
  saveToVariable: 'user.name',      // Variable to save to
  validation: {                     // Validation (optional)
    type: 'email',
    errorMessage: 'invalid_email'
  },
  nextStep: 'next_step_id'
}
```

#### `handler` - Execute handler
```typescript
{
  type: 'handler',
  id: 'step_id',
  handlerName: 'handlerName',       // Handler name from handlers.ts
  nextStep: 'next_step_id'
}
```

#### `flow` - Switch to another flow
```typescript
{
  type: 'flow',
  id: 'step_id',
  flowName: 'other_flow_name'
}
```

#### `dynamic` - Dynamic content
```typescript
{
  type: 'dynamic',
  id: 'step_id',
  handler: 'generateDynamicContent', // Handler for generation
  keyboardKey: 'dynamic_keyboard',  // Keyboard (optional)
  nextStep: 'next_step_id'
}
```

### 3. Flow autogeneration

After creating a flow, run autogeneration:

```bash
npm run generate-flows-index
```

This will automatically:
- Find all flows in the `flows/` folder
- Generate `index.ts` with imports
- Connect flows to the system

## 🔘 Creating Buttons

### 1. Static buttons in `callbacks.ts`

```typescript
// apps/bot/src/config/callbacks.ts
export const keyboards = {
  main_menu: {
    inline_keyboard: [
      [
        { text: "📄 Create Invoice", callback_data: "create_invoice" },
        { text: "📊 Reports", callback_data: "reports" }
      ],
      [
        { text: "👤 Profile", callback_data: "profile" },
        { text: "⚙️ Settings", callback_data: "settings" }
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

### 2. Handling button clicks

```typescript
// apps/bot/src/config/callbacks.ts
export const callbackActions = {
  // Language selection handling
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

  // Start flow
  'create_invoice': {
    action: 'start_flow',
    flowName: 'create_invoice'
  },

  // Navigate to step
  'go_to_profile': {
    action: 'go_to_step',
    stepId: 'show_profile'
  }
};
```

## ⚙️ Creating Handlers

### 1. Command handlers

```typescript
// apps/bot/src/config/handlers.ts
export const createCustomHandlers = (worker: BotInterface) => ({
  // Command handler
  handleMyCommand: async (message: any, bot: any) => {
    const userId = message.from.id;
    // Command logic
  },

  // Flow step handler
  processUserData: async (telegramId: number, contextManager: UserContextManager) => {
    const userName = await contextManager.getVariable(telegramId, 'user.name');
    const userEmail = await contextManager.getVariable(telegramId, 'user.email');
    
    // Process data
    console.log(`Processing user: ${userName}, email: ${userEmail}`);
    
    // Save to DB
    await worker.d1Storage.addUser({
      name: userName,
      email: userEmail,
      // ... other fields
    });
  },

  // Dynamic handler
  generateDynamicContent: async (telegramId: number, contextManager: UserContextManager) => {
    // Get data from DB
    const data = await worker.d1Storage.getSomeData();
    
    // Generate message
    return `Data: ${JSON.stringify(data)}`;
  }
});
```

### 2. Available services in handlers

```typescript
// Available in handlers:
const handlerWorker = {
  d1Storage: worker['d1Storage'],        // Database
  flowEngine: worker['flowEngine'],      // Flow engine
  env: worker['env'],                    // Environment variables
  messageService: worker['messageService'], // Send messages
  topicService: worker['topicService']   // Telegram topics
};

// Usage examples:
await handlerWorker.d1Storage.getUser(telegramId);
await handlerWorker.messageService.sendMessage(telegramId, 'Hello!');
await contextManager.setVariable(telegramId, 'key', 'value');
```

## 💬 Message System

### 1. Message keys

Create a file with messages (e.g., in `src/core/messages.ts`):

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

### 2. Usage in flows

```typescript
{
  type: 'message',
  id: 'welcome',
  messageKey: 'welcome_message',  // Key from messages
  keyboardKey: 'main_menu'
}
```

## 🚀 Advanced Techniques

### 1. Conditional navigation

```typescript
{
  type: 'condition',
  id: 'check_user_type',
  condition: 'user.type === "premium"',
  trueFlow: 'premium_flow',
  falseFlow: 'basic_flow'
}
```

### 2. Dynamic buttons

```typescript
// In handler
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
    message: 'Select a course:',
    keyboard: { inline_keyboard: [buttons] }
  };
}
```

### 3. Input validation

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

### 4. Working with files

```typescript
// In handler
handleFileUpload: async (telegramId, contextManager) => {
  const file = await contextManager.getVariable(telegramId, '_system.currentFile');
  
  // Save to R2
  await worker.env.BOT_STORAGE.put(`users/${telegramId}/file.pdf`, file);
  
  // Create public link
  const publicUrl = `https://pub-${bucketId}.r2.dev/users/${telegramId}/file.pdf`;
}
```

## 🔧 Deployment

### 1. Configure wrangler.toml

```toml
name = "my-bot"
main = "src/worker/worker.ts"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "my-bot-db"
database_id = "your-database-id"

# R2 Storage (optional)
[[r2_buckets]]
binding = "BOT_STORAGE"
bucket_name = "my-bot-storage"
```

### 2. Set secrets

```bash
# Bot token
wrangler secret put BOT_TOKEN

# Admin chat ID
wrangler secret put ADMIN_CHAT_ID
```

### 3. Deploy

```bash
# Generate flows
npm run generate-flows-index

# Deploy
npm run deploy
```

### 4. Configure webhook

```bash
# After deployment
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-worker.your-subdomain.workers.dev"}'
```

## 📚 Example Bots

### 1. Questionnaire Bot
- Flows: `questionnaire.ts`
- Commands: `/start`, `/restart`
- Buttons: answer option selection

### 2. Catalog Bot
- Flows: `catalog.ts`, `product_details.ts`
- Commands: `/catalog`, `/search`
- Dynamic buttons: products from DB

### 3. Order Bot
- Flows: `order.ts`, `payment.ts`
- Commands: `/order`, `/status`
- Payment systems integration

## 🎯 Best Practices

### 1. Flow structure
- ✅ One flow = one task
- ✅ Clear step IDs
- ✅ Error handling
- ✅ Input validation

### 2. Naming
- ✅ Commands: `/action_name`
- ✅ Flows: `action_name`
- ✅ Handlers: `handleActionName`
- ✅ Variables: `category.subcategory`

### 3. Error handling
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

**🎉 Ready! You can now create powerful Telegram bots with our builder!**

For help, refer to:
- [README.md](../README.md) - general information
- [DEPLOYMENT.md](./DEPLOYMENT.md) - deployment
- [Flow examples](./src/config/flows/) - ready examples
