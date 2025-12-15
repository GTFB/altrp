# 🛠️ Bot Builder Guide

**Step-by-step guide for creating Telegram bots with our builder**

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Architecture Overview](#-architecture-overview)
3. [Project Structure](#-project-structure)
4. [Creating Commands](#-creating-commands)
5. [Creating Flows](#-creating-flows)
6. [Creating Buttons](#-creating-buttons)
7. [Creating Handlers](#-creating-handlers)
8. [Working with Repositories](#-working-with-repositories)
9. [AI Integration](#-ai-integration)
10. [Topic-Based Flows](#-topic-based-flows)
11. [Message System](#-message-system)
12. [Advanced Techniques](#-advanced-techniques)
13. [Best Practices](#-best-practices)
14. [Deployment](#-deployment)

## 🚀 Quick Start

### 1. Project Setup
```bash
# Clone and install
git clone <repository>
cd apps/bot/leadsgen
npm install

# For Cloudflare Workers: Configure settings
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your data

# For Node.js: Configure environment
cp env.example .env
# Edit .env with your PostgreSQL connection and bot token
```

### 2. Create Your First Bot
```bash
# 1. Create a command
# 2. Create a flow
# 3. Create handlers
# 4. Run autogeneration
npm run generate-flows-index

# 5. Deploy the bot
# For Cloudflare Workers:
npm run deploy

# For Node.js:
npm run build:nodejs
npm run start:nodejs
# Or use Docker:
docker build -t telegram-bot .
docker run -p 3100:3100 -e DATABASE_URL=... -e BOT_TOKEN=... telegram-bot
```

## 🏗️ Architecture Overview

The bot builder follows a **modular architecture** with clear separation of concerns:

### Core Components

1. **Repositories** (`src/repositories/`)
   - Database operations for specific tables
   - One repository per database table
   - Examples: `HumanRepository`, `MessageRepository`, `MessageThreadRepository`, `TextRepository`
   - Special: `AIRepository` for AI API operations

2. **Core Services** (`src/core/`)
   - Business logic and orchestration
   - `bot.ts`: Main bot controller (shared between Worker and Node.js)
   - `env.ts`: Common environment interface
   - `FlowEngine`: Manages conversational flows
   - `MessageService`: Sends messages to Telegram
   - `MessageLoggingService`: Logs all messages to database
   - `TopicService`: Manages Telegram forum topics
   - `UserContextManager`: Manages user state and variables

3. **Integrations** (`src/integrations/`)
   - External API integrations
   - `AIService`: Low-level AI API client

4. **Helpers** (`src/helpers/`)
   - Utility functions
   - `generateAid`: Generate short IDs
   - `generateUuidV4`: Generate UUIDs
   - `getMessageType`: Determine message type

5. **Configuration** (`src/config/`)
   - Bot configuration (commands, callbacks, handlers, flows)
   - Created by bot builders

### Dependency Injection

Services and repositories are injected through the `BotInterface`:

```typescript
export interface BotInterface {
  d1Storage: D1StorageService;           // Generic database executor (works with D1 or PostgreSQL)
  humanRepository: HumanRepository;      // Humans table operations
  messageRepository: MessageRepository;  // Messages table operations
  messageThreadRepository: MessageThreadRepository; // Message threads operations
  flowEngine: FlowEngine;                 // Flow orchestration
  env: Env;                               // Environment variables (supports both D1Database and PostgresD1Adapter)
  messageService: MessageService;         // Message sending
  topicService: TopicService;             // Topic management
  userContextManager: UserContextManager;  // User context management
}
```

All handlers receive this interface and can access any service or repository.

## 📁 Project Structure

```
/apps/bot/leadsgen/src/
├── /config/                    # Bot configuration (configured by builder)
│   ├── commands.ts             # Bot commands (/start, /help, etc.)
│   ├── callbacks.ts            # Buttons and keyboards
│   ├── handlers.ts             # Business logic and handlers
│   └── flows/                  # Bot flows (dialogs)
│       ├── index.ts           # Auto-generated
│       ├── onboarding.ts
│       └── ...
│
├── /core/                      # System core (shared between Worker and Node.js)
│   ├── bot.ts                  # Main bot controller (shared)
│   ├── env.ts                  # Common environment interface
│   ├── flow-engine.ts          # Flow orchestration engine
│   ├── message-service.ts      # Message sending service
│   ├── message-logging-service.ts # Message logging service
│   ├── topic-service.ts        # Telegram topic management
│   ├── user-context.ts         # User context and state management
│   └── bot-interface.ts       # Interface for dependency injection
│
├── /repositories/              # Database repositories (shared, work with both D1 and PostgreSQL)
│   ├── HumanRepository.ts      # Humans table operations
│   ├── MessageRepository.ts    # Messages table operations
│   ├── MessageThreadRepository.ts # Message threads operations
│   ├── TextRepository.ts      # Texts table operations
│   └── AIRepository.ts         # AI API operations
│
├── /integrations/               # External API integrations
│   └── ai-service.ts           # Low-level AI API client
│
├── /helpers/                    # Utility functions
│   ├── generateAid.ts          # Generate short IDs
│   ├── generateUuidV4.ts       # Generate UUIDs
│   └── getMessageType.ts       # Message type detection
│
├── /worker/                     # Cloudflare Workers specific
│   ├── worker.ts               # Cloudflare Worker entry point
│   └── d1-storage-service.ts   # Generic database executor (works with D1 or PostgreSQL adapter)
│
└── /nodejs/                     # Node.js specific
    ├── server.mjs              # Express server entry point
    ├── postgres-d1-adapter.ts   # PostgreSQL adapter (mimics D1Database API)
    └── postgres-storage-service.ts # PostgreSQL storage service
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
export const createCustomHandlers = (worker: BotInterface) => {
  const handlerWorker = {
    d1Storage: worker['d1Storage'],
    humanRepository: worker['humanRepository'],
    messageRepository: worker['messageRepository'],
    messageThreadRepository: worker['messageThreadRepository'],
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };

  return {
    // New command handler
    handleMyCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /my_command for user ${userId}`);
      
      // Your logic here
      await handlerWorker.flowEngine.startFlow(userId, 'my_flow');
    }
  };
};
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
  saveToVariable: 'user.name',       // Variable to save to
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
        { text: "🇬🇧 English", callback_data: "lang_select_en" }
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
  'lang_select_en': {
    action: 'set_variable',
    variable: 'user.language',
    value: 'en',
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
  },

  // Execute custom handler
  'new_lead_status': {
    action: 'handler',
    handlerName: 'setStatusHandler'
  }
};
```

**Callback Action Types:**
- `start_flow`: Start a new flow
- `go_to_step`: Navigate to a specific step in current flow
- `set_variable`: Set a context variable
- `handler`: Execute a custom handler from `handlers.ts`

## ⚙️ Creating Handlers

### 1. Handler structure

```typescript
// apps/bot/src/config/handlers.ts
export const createCustomHandlers = (worker: BotInterface) => {
  const handlerWorker = {
    d1Storage: worker['d1Storage'],
    humanRepository: worker['humanRepository'],
    messageRepository: worker['messageRepository'],
    messageThreadRepository: worker['messageThreadRepository'],
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };

  // Create AI repository (if needed)
  const aiRepository = new AIRepository({
    env: {
      AI_API_URL: handlerWorker.env.AI_API_URL,
      AI_API_TOKEN: handlerWorker.env.AI_API_TOKEN,
      BOT_TOKEN: handlerWorker.env.BOT_TOKEN,
      TRANSCRIPTION_MODEL: handlerWorker.env.TRANSCRIPTION_MODEL
    }
  });

  return {
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
      
      // Save to DB using repository
      await handlerWorker.humanRepository.updateHuman(telegramId, {
        fullName: userName,
        email: userEmail
      });
    },

    // Dynamic handler
    generateDynamicContent: async (telegramId: number, contextManager: UserContextManager) => {
      // Get data from repository
      const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
      
      // Generate message
      return `Hello, ${human?.fullName || 'User'}!`;
    }
  };
};
```

### 2. Available services in handlers

```typescript
// Available in handlers:
const handlerWorker = {
  d1Storage: worker['d1Storage'],              // Generic database executor
  humanRepository: worker['humanRepository'],  // Humans table operations
  messageRepository: worker['messageRepository'], // Messages table operations
  messageThreadRepository: worker['messageThreadRepository'], // Message threads
  flowEngine: worker['flowEngine'],             // Flow engine
  env: worker['env'],                          // Environment variables
  messageService: worker['messageService'],     // Send messages
  topicService: worker['topicService']          // Telegram topics
};

// Usage examples:
const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
await handlerWorker.messageService.sendMessage(chatId, 'Hello!', human.id);
await contextManager.setVariable(telegramId, 'key', 'value');
```

## 💾 Working with Repositories

Repositories provide a clean interface for database operations. **Always use repositories instead of direct database access.**

### HumanRepository

Operations on the `humans` table:

```typescript
// Get human by Telegram ID
const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);

// Get human by database ID
const human = await handlerWorker.humanRepository.getHumanById(humanId);

// Add new human
const humanId = await handlerWorker.humanRepository.addHuman({
  fullName: 'John Doe',
  email: 'john@example.com'
});

// Update human
await handlerWorker.humanRepository.updateHuman(humanId, {
  statusName: 'active',
  email: 'newemail@example.com'
});

// Update human data_in field
await handlerWorker.humanRepository.updateHumanDataIn(humanId, {
  topic_id: 123,
  customField: 'value'
});

// Get human Telegram ID by topic ID
const telegramId = await handlerWorker.humanRepository.getHumanTelegramIdByTopic(topicId);
```

### MessageRepository

Operations on the `messages` table:

```typescript
// Add message (automatically determines maid from topic)
await handlerWorker.messageRepository.addMessage({
  humanId: human.id,
  messageType: 'user_text',
  direction: 'incoming',
  content: 'Hello!',
  telegramMessageId: message.message_id,
  statusName: 'text'
});

// Get recent messages
const recentMessages = await handlerWorker.messageRepository.getRecentMessages(
  maid,           // Message thread maid
  human.haid,     // Human haid
  'text',         // Status name filter
  10              // Limit (optional)
);

// Get all messages for summarization
const allMessages = await handlerWorker.messageRepository.getAllMessagesByMaid(
  maid,
  human.haid,
  'text'
);
```

### MessageThreadRepository

Operations on the `message_threads` table:

```typescript
// Add message thread
const threadId = await handlerWorker.messageThreadRepository.addMessageThread({
  value: topicId.toString(),  // Topic ID
  title: 'User Conversation',
  type: 'leadsgen',
  xaid: human.haid,
  statusName: 'active',
  dataIn: JSON.stringify({
    prompt: 'You are a helpful assistant...',
    model: 'gemini-2.5-flash',
    context_length: 6
  })
});

// Update message thread
await handlerWorker.messageThreadRepository.updateMessageThread(threadId, {
  dataIn: JSON.stringify(updatedSettings),
  statusName: 'archived'
});

// Get message thread by value (topic ID)
const thread = await handlerWorker.messageThreadRepository.getMessageThreadByValue(
  topicId.toString(),
  'leadsgen'
);
```

### TextRepository

Operations on the `texts` table:

```typescript
// Get text by taid
const text = await handlerWorker.textRepository.getTextByTaid('taid123');

// Get taid by content
const taid = await handlerWorker.textRepository.getTaidByContent('Some text content');
```

### AIRepository

AI API operations (see [AI Integration](#-ai-integration) section for details):

```typescript
// Get AI response
const response = await aiRepository.getAIResponse(
  recentMessages,
  messageText,
  prompt,
  model,
  summary
);

// Generate summary
const summary = await aiRepository.generateSummary(
  messagesToSummarize,
  model,
  currentSummaryVersion,
  historySummaryText
);

// Transcribe voice
const transcript = await aiRepository.transcribeVoice(fileId, mimeType);
```

## 🤖 AI Integration

### AIRepository

The `AIRepository` provides high-level methods for AI operations:

```typescript
// In handlers.ts
const aiRepository = new AIRepository({
  env: {
    AI_API_URL: handlerWorker.env.AI_API_URL,
    AI_API_TOKEN: handlerWorker.env.AI_API_TOKEN,
    BOT_TOKEN: handlerWorker.env.BOT_TOKEN,
    TRANSCRIPTION_MODEL: handlerWorker.env.TRANSCRIPTION_MODEL
  }
});
```

### Getting AI Response

```typescript
// Get recent messages from repository
const recentMessages = await handlerWorker.messageRepository.getRecentMessages(
  maid,
  human.haid,
  'text',
  10
);

// Get AI response
const aiResponse = await aiRepository.getAIResponse(
  recentMessages,        // Array of recent messages
  messageText,          // Current user message
  prompt,               // System prompt/instruction
  model,                // Model name (e.g., 'gemini-2.5-flash')
  summary               // Optional context summary
);
```

**AI Response Format:**
- Uses `system_instruction` for background context (summary)
- Uses `contents` array for conversational history
- Automatically validates and fixes HTML tags in responses

### Generating Summary

```typescript
// Get all messages for summarization
const allMessages = await handlerWorker.messageRepository.getAllMessagesByMaid(
  maid,
  human.haid,
  'text'
);

// Generate summary
const summary = await aiRepository.generateSummary(
  messagesToSummarize,      // Messages to summarize
  model,                     // Model name
  currentSummaryVersion,     // Current summary version
  historySummaryText         // Previous summary (optional)
);
```

### Voice Transcription

```typescript
// Transcribe voice message
const transcript = await aiRepository.transcribeVoice(
  fileId,     // Telegram file ID
  mimeType    // MIME type (e.g., 'audio/ogg')
);

// Save transcribed message
if (transcript) {
  await handlerWorker.messageRepository.addMessage({
    humanId: human.id,
    messageType: 'user_text',
    direction: 'incoming',
    content: transcript,
    telegramMessageId: message.message_id,
    statusName: 'text',
    data: JSON.stringify({
      fileId: message.voice.file_id,
      mimeType: mimeType,
      isTranscribed: true,
      originalType: 'voice'
    })
  });
}
```

## 💬 Topic-Based Flows

Topic-based flows allow admins to manage flows within user topics in Telegram forum groups.

### Starting a Topic Flow

```typescript
// In handler
await handlerWorker.flowEngine.startTopicFlow(
  adminId,        // Admin Telegram ID
  topicId,        // Topic ID where flow runs
  'set_status',   // Flow name
  targetUserId,   // Optional: User being managed
  adminChatId     // Optional: Admin chat ID
);
```

### Handling Topic Messages

When an admin sends a message in a topic while in flow mode, the flow engine automatically handles it:

```typescript
// In bot.ts (automatic)
if (admin is in flowInTopic mode) {
  await flowEngine.handleTopicMessage(adminId, messageText);
} else {
  await topicService.handleMessageFromTopic(message);
}
```

### Handling Topic Callbacks

Similarly for callbacks:

```typescript
// In bot.ts (automatic)
if (admin is in flowInTopic mode) {
  await flowEngine.handleTopicCallback(adminId, callbackData);
} else {
  await topicService.handleCallbackFromTopic(callbackQuery);
}
```

### Context Flags

Topic flows use special context flags:

```typescript
const context = await userContextManager.getContext(adminId);
if (context.flowInTopic) {
  // Flow is running in topic mode
  const topicId = context.topicId;
  const targetUserId = context.targetUserId;
  // Send messages to topic instead of private chat
}
```

### Example: Status Handler in Topic

```typescript
// In handlers.ts
setStatusHandler: async (callbackData: string, message: any) => {
  const adminId = message.from.id;
  const topicId = message.message_thread_id;
  
  // Determine status from callback data
  let statusName = 'NEW';
  if (callbackData.includes('hot')) statusName = 'HOT';
  if (callbackData.includes('sell')) statusName = 'SELL';
  
  // Update human status
  const human = await handlerWorker.humanRepository.getHumanByTelegramId(targetUserId);
  await handlerWorker.humanRepository.updateHuman(human.id, { statusName });
  
  // Update topic icon
  const iconMap = {
    'NEW': '5312536423851630001',
    'HOT': '5312241539987020022',
    'SELL': '5350452584119279096'
  };
  await handlerWorker.topicService.editTopicIcon(topicId, iconMap[statusName]);
  
  // Complete flow
  await handlerWorker.flowEngine.completeFlow(adminId);
}
```

## 💬 Message System

### MessageService

Sends messages to Telegram:

```typescript
// Send text message
await handlerWorker.messageService.sendMessage(chatId, 'Hello!', humanId);

// Send message with keyboard
await handlerWorker.messageService.sendMessageWithKeyboard(
  chatId,
  'Choose option:',
  keyboard,
  humanId
);

// Send to topic
await handlerWorker.messageService.sendMessageToTopic(
  chatId,
  topicId,
  'Message text',
  humanId
);
```

**Note:** All messages are automatically logged by `MessageLoggingService`.

### MessageLoggingService

Automatically logs all messages:

- **Incoming messages**: Logged when received
- **Outgoing messages**: Logged when sent via `MessageService`
- **Status names**: Automatically determined:
  - `'flow_mode'`: User is in flow mode
  - `'text'`: Text message
  - `'voice'`: Voice message
  - `'photo'`: Photo message
  - `'document'`: Document message

### Message Types

```typescript
type MessageType = 
  | 'user_text' | 'user_voice' | 'user_photo' | 'user_document' | 'user_callback'
  | 'bot_text' | 'bot_photo' | 'bot_voice' | 'bot_document'
  | 'command';
```

### Message Status Names

- `'flow_mode'`: Message sent during flow execution
- `'text'`: Regular text message
- `'voice'`: Voice message
- `'photo'`: Photo message
- `'document'`: Document message

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
  // Get data from repository
  const courses = await handlerWorker.d1Storage.execute(
    'SELECT * FROM courses'
  );
  
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
  await handlerWorker.env.BOT_STORAGE.put(`users/${telegramId}/file.pdf`, file);
  
  // Create public link
  const publicUrl = `https://pub-${bucketId}.r2.dev/users/${telegramId}/file.pdf`;
}
```

## 🎯 Best Practices

### 1. Architecture

- ✅ **Use repositories** instead of direct database access
- ✅ **Use AIRepository** for all AI operations
- ✅ **Follow single responsibility principle**: One repository per table
- ✅ **Use helpers** for common utilities
- ✅ **Dependency injection**: Access services through `BotInterface`

### 2. Flow structure

- ✅ One flow = one task
- ✅ Clear step IDs
- ✅ Error handling
- ✅ Input validation

### 3. Naming conventions

- ✅ Commands: `/action_name`
- ✅ Flows: `action_name`
- ✅ Handlers: `handleActionName`
- ✅ Repositories: `EntityRepository` (e.g., `HumanRepository`)
- ✅ Services: `EntityService` (e.g., `MessageService`)
- ✅ Variables: `category.subcategory`

### 4. Error handling

```typescript
try {
  await processData();
} catch (error) {
  console.error('Error:', error);
  await contextManager.setVariable(telegramId, 'error', error.message);
  await flowEngine.goToStep(telegramId, 'error_handler');
}
```

### 5. Repository usage

```typescript
// ✅ Good: Use repository
const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);

// ❌ Bad: Direct database access
const result = await handlerWorker.d1Storage.execute('SELECT * FROM humans WHERE telegram_id = ?', [telegramId]);
```

### 6. Message logging

```typescript
// ✅ Good: Use MessageService (auto-logs)
await handlerWorker.messageService.sendMessage(chatId, 'Hello!', humanId);

// ❌ Bad: Direct API call (not logged)
await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {...});
```

## 🔧 Deployment

### Cloudflare Workers Deployment

#### 1. Configure wrangler.toml

```toml
name = "my-bot"
main = "src/worker/worker.ts"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "my-bot-db"
database_id = "your-database-id"

# R2 Storage (optional, used only in your custom extensions)
[[r2_buckets]]
binding = "BOT_STORAGE"
bucket_name = "my-bot-storage"
```

#### 2. Set secrets

```bash
# Bot token
wrangler secret put BOT_TOKEN

# AI API (if using AI features)
wrangler secret put AI_API_URL
wrangler secret put AI_API_TOKEN
wrangler secret put TRANSCRIPTION_MODEL
```

#### 3. Deploy

```bash
# Generate flows
npm run generate-flows-index

# Deploy
npm run deploy
```

#### 4. Configure webhook

```bash
# After deployment
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-worker.your-subdomain.workers.dev"}'
```

### Node.js Deployment with PostgreSQL

#### 1. Configure environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your settings:
# DATABASE_URL=postgresql://user:password@host:5432/database
# BOT_TOKEN=your_bot_token
# PORT=3100
```

#### 2. Run migrations

```bash
# Migrations run automatically on container start
# Or manually:
npm run migrate:postgres
```

#### 3. Build and run

```bash
# Build TypeScript
npm run build:nodejs

# Run directly
npm run start:nodejs

# Or use Docker
docker build -t telegram-bot .
docker run -p 3100:3100 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e BOT_TOKEN=your_token \
  telegram-bot
```

#### 4. Configure webhook

```bash
# After deployment
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/"}'
```

### Database Adapter Pattern

The bot uses a **unified codebase** that works with both D1 Database (Cloudflare Workers) and PostgreSQL (Node.js):

- **Repositories** work with both databases via adapter pattern
- **PostgresD1Adapter** automatically converts SQLite syntax to PostgreSQL
- **No code duplication** - same repositories work for both
- **D1StorageService** accepts both `D1Database` and `PostgresD1Adapter`

See [README.md](./README.md) for more details on the architecture.

## 📚 Example Bots

### 1. Questionnaire Bot
- Flows: `questionnaire.ts`
- Commands: `/start`, `/restart`
- Buttons: answer option selection
- Uses: `HumanRepository` for storing answers

### 2. Catalog Bot
- Flows: `catalog.ts`, `product_details.ts`
- Commands: `/catalog`, `/search`
- Dynamic buttons: products from DB
- Uses: `MessageRepository` for conversation history

### 3. Order Bot
- Flows: `order.ts`, `payment.ts`
- Commands: `/order`, `/status`
- Payment systems integration
- Uses: `MessageThreadRepository` for order threads

### 4. AI Assistant Bot
- Flows: `start_conversation.ts`
- Commands: `/start`
- AI integration: `AIRepository` for responses
- Topic-based: Admin manages conversations in topics
- Uses: `MessageRepository` for context, `AIRepository` for AI

---

**🎉 Ready! You can now create powerful Telegram bots with our builder!**

## 📚 Additional Resources

For help, refer to:
- [README.md](../README.md) - general information and architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - detailed deployment instructions
- [Flow examples](../src/config/flows/) - ready-made flow examples

## 🔑 Key Architecture Points

### Unified Codebase
- **Single `bot.ts`** in `core/` - shared between Worker and Node.js
- **Common `Env` interface** - `DB: D1Database | PostgresD1Adapter`
- **Shared repositories** - work with both databases via adapter

### Database Compatibility
- Repositories use D1 API: `db.prepare().bind().run()/.all()/.first()`
- `PostgresD1Adapter` converts SQLite syntax to PostgreSQL automatically
- No code changes needed when switching between databases

### Deployment Flexibility
- **Cloudflare Workers**: Serverless, uses D1 Database
- **Node.js**: Traditional server, uses PostgreSQL
- Same codebase, different deployment targets
