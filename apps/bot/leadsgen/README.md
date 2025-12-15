# 🤖 Telegram Bot Builder

**A powerful builder for creating Telegram bots with modular architecture.**

This is not just a bot, but a full-featured **bot builder** - a tool that allows bot builders to easily create, configure, and deploy their own bots without deep programming knowledge.

## 🚀 Deployment Options

The bot supports two deployment options:

- **Cloudflare Workers** - Serverless deployment on Cloudflare's edge network (uses D1 Database)
- **Node.js** - Traditional server deployment with PostgreSQL support (Docker-ready)

## 🎯 What is this?

**Bot Builder** is a platform that provides:

- **Ready-made architecture** for creating bots
- **Modular flow system** (dialogs)
- **Automatic code generation**
- **Ready-made components** (commands, handlers, storage)
- **Simple deployment** to Cloudflare

## 🏗️ Builder Architecture

### 📁 Project Structure

```
/apps/bot/leadsgen
├── /src
│   ├── /core                         # System core (shared)
│   │   ├── bot.ts                    # Main bot controller (shared)
│   │   ├── env.ts                    # Common environment interface
│   │   ├── flow-engine.ts            # Flow engine
│   │   ├── message-service.ts        # Message service
│   │   ├── message-logging-service.ts # Message logging
│   │   ├── topic-service.ts          # Topic management
│   │   ├── user-context.ts           # User context
│   │   └── bot-interface.ts          # Bot interface
│   │
│   ├── /config                       # Configuration (configured by builder)
│   │   ├── /flows                    # Bot flows (auto-generated)
│   │   │   ├── index.ts              # Automatically generated
│   │   │   ├── onboarding.ts
│   │   │   └── ...                   # Other flows
│   │   ├── commands.ts               # Bot commands
│   │   ├── callbacks.ts              # Callback buttons
│   │   └── handlers.ts               # Logic handlers
│   │
│   ├── /repositories                 # Data repositories (shared)
│   │   ├── HumanRepository.ts
│   │   ├── MessageRepository.ts
│   │   └── ...
│   │
│   ├── /worker                       # Cloudflare Workers specific
│   │   ├── worker.ts                 # Worker entry point
│   │   └── d1-storage-service.ts     # D1 storage service
│   │
│   ├── /nodejs                       # Node.js specific
│   │   ├── server.mjs                # Express server entry point
│   │   ├── postgres-d1-adapter.ts    # PostgreSQL adapter (D1 API compatible)
│   │   └── postgres-storage-service.ts
│   │
│   └── /scripts                      # Builder tools
│       ├── generate-flows-index.js   # Flow auto-generation
│       └── migrate-postgres.mjs      # PostgreSQL migrations
│
├── Dockerfile                         # Docker configuration for Node.js
├── wrangler.toml                     # Cloudflare Workers configuration
├── docs/
│   ├── DEPLOYMENT.md                 # Deployment instructions
│   └── BOT_BUILDER_GUIDE.md          # Builder guide
└── README.md                         # This file
```

## 🎨 How the builder works

### 1. **Modular flow system**

The builder creates flows in separate files:

```typescript
// apps/bot/src/config/flows/onboarding.ts
export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Registration process',
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
    // ... other steps
  ]
};
```

### 2. **Automatic flow registration**

The builder automatically:
- **Finds all flows** in the `flows/` folder
- **Generates `index.ts`** with imports
- **Connects flows** to the engine

```bash
npm run generate-flows-index
# ✅ Automatically finds and connects all flows
```

**Note:** MDX content generation has been removed - content is now stored in the database.

### 3. **Ready-made components**

#### Bot commands (`commands.ts`)
```typescript
export const commands = [
  { name: "/start", handlerName: "handleStartCommand" },
  { name: "/menu", handlerName: "handleMenuCommand" },
  { name: "/help", handlerName: "handleHelpCommand" }
];
```

#### Callback buttons (`callbacks.ts`)
```typescript
export const keyboards = {
  main_menu: {
    inline_keyboard: [[
      { text: "📄 Create Invoice", callback_data: "create_invoice" },
      { text: "📊 Reports", callback_data: "reports" }
    ]]
  }
};
```

#### Logic handlers (`handlers.ts`)
```typescript
export const createCustomHandlers = (worker: BotInterface) => ({
  handleStartCommand: async (message, bot) => {
    // /start command logic
  },
  createInvoice: async (telegramId, contextManager) => {
    // Invoice creation logic
  }
});
```

## 🚀 Features for builders

### ✅ **Easy flow addition**
1. Create `new_flow.ts` file in `flows/` folder
2. Run `npm run generate-flows-index`
3. Flow automatically connects!

### ✅ **Ready-made step types**
- `message` - send message
- `wait_input` - wait for input
- `handler` - execute logic
- `flow` - transition to another flow
- `dynamic` - dynamic content
- `condition` - conditional transitions

### ✅ **Variable system**
```typescript
// Save user data
await contextManager.setVariable(telegramId, 'user.name', 'John');
await contextManager.setVariable(telegramId, 'company.tax_id', '123456789');

// Get data
const userName = await contextManager.getVariable(telegramId, 'user.name');
```

### ✅ **Internationalization**
```typescript
// Multi-language support
const message = await i18nService.getMessage('welcome_message', 'en');
```

### ✅ **Data storage**
- **Cloudflare Workers**: D1 Database (SQLite), KV Storage, R2 Storage
- **Node.js**: PostgreSQL (via adapter that mimics D1 API)

## 🛠️ Tech stack

### Cloudflare Workers
- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Database**: SQLite (Cloudflare D1)
- **Cache**: Cloudflare KV
- **Files**: Cloudflare R2
- **Language**: TypeScript
- **Build**: Wrangler CLI

### Node.js
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL (with D1 API adapter)
- **Server**: Express.js
- **Language**: TypeScript
- **Deployment**: Docker-ready

## 📋 Quick start for builders

### 1. **Clone and setup**
```bash
git clone <repository>
cd apps/bot
npm install
```

### 2. **Create first flow**
```bash
# Create flows/my_flow.ts file
# Run auto-generation
npm run generate-flows-index
```

### 3. **Add command**
```typescript
// In commands.ts
{ name: "/my_command", handlerName: "handleMyCommand" }

// In handlers.ts
handleMyCommand: async (message, bot) => {
  // Your logic
}
```

### 4. **Deploy**

#### Cloudflare Workers
```bash
npm run deploy
```

#### Node.js with PostgreSQL
```bash
# Using Docker
docker build -t telegram-bot .
docker run -p 3100:3100 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e BOT_TOKEN=your_token \
  telegram-bot

# Or directly with Node.js
npm run build:nodejs
npm run start:nodejs
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 🎯 Builder advantages

### For bot builders:
- ✅ **Fast development** - ready-made components
- ✅ **Modularity** - easy to add features
- ✅ **Auto-generation** - minimal manual work
- ✅ **Ready deployment** - one click
- ✅ **Scalability** - easy to extend

### For bot users:
- ✅ **Reliability** - Cloudflare infrastructure
- ✅ **Speed** - global network
- ✅ **Security** - isolation and protection
- ✅ **Performance** - optimized code

## 📚 Documentation

- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Detailed deployment instructions
- **[BOT_BUILDER_GUIDE.md](./docs/BOT_BUILDER_GUIDE.md)** - Guide for bot builders
- **[Flow Architecture](./src/core/flow-types.ts)** - Types and interfaces
- **[Flow Examples](./src/config/flows/)** - Ready-made examples

## 🔧 Architecture Highlights

### Unified Codebase
- **Single `bot.ts`** in `core/` - shared between Worker and Node.js versions
- **Common `Env` interface** - supports both D1Database and PostgresD1Adapter
- **Shared repositories** - work with both databases via adapter pattern

### Database Adapter Pattern
The `PostgresD1Adapter` allows PostgreSQL to work with the same API as D1 Database:
- Automatic SQL syntax conversion (SQLite → PostgreSQL)
- Placeholder conversion (`?` → `$1, $2, ...`)
- JSON function conversion (`json_extract` → PostgreSQL JSON operators)
- Same interface for repositories - no code duplication needed

### Environment Configuration
```typescript
// Common interface works for both
interface Env {
  DB: D1Database | PostgresD1Adapter; // Unified type
  BOT_TOKEN: string;
  // ... other fields
}
```

## 🤝 Contributing

The builder is open for improvements! You can:
- Add new step types
- Create ready-made flow templates
- Improve auto-generation
- Extend functionality

---

**🎉 Create your bots easily and quickly!**