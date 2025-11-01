# 🤖 Consultant Bot Setup Guide

This bot creates a group with forum topics where each topic is a different consultant powered by AI.

## 📋 Overview

The bot uses topics in Telegram groups to represent different consultants. Each consultant has:
- **Name** - Unique identifier (e.g., `financier`, `dietitian`)
- **Title** - Display name (e.g., "Financial Consultant")
- **Prompt** - System prompt for the AI
- **Model** - AI model to use (e.g., `gemini-2.5-flash`)
- **Context Length** - Number of recent messages for context

## 🗄️ Database Schema

### Tables Used

1. **taxonomy** - Stores consultants
   - `entity` = 'consultant'
   - `name` = consultant identifier
   - `title` = display name

2. **settings** - Stores consultant configuration
   - `attribute` = `consultant_{name}_prompt` - System prompt
   - `attribute` = `consultant_{name}_model` - AI model
   - `attribute` = `consultant_{name}_context_length` - Context size
   - `attribute` = `consultant_{name}_topic_id` - Telegram topic ID

3. **message_threads** - Maps topics to consultants
   - `type` = 'consultant'
   - `maid` = consultant name
   - `title` = topic name

4. **messages** - Stores conversation history
   - `maid` = `consultant_{name}`
   - `data_in` = JSON with message content

## 🚀 Setup Instructions

### 1. Initialize Database

Apply the database schema:

```bash
npx wrangler d1 execute consultant-bot-db --file=20251024_171847.sql --remote
```

Initialize consultants:

```bash
npx wrangler d1 execute consultant-bot-db --file=init_consultants.sql --remote
```

### 2. Configure Environment

Add to your `wrangler.toml` or set as secrets:

```toml
[vars]
AI_API_URL = "https://api-gateway-dev.altrp.workers.dev"
```

Set secrets:

```bash
npx wrangler secret put AI_API_TOKEN
npx wrangler secret put BOT_TOKEN
npx wrangler secret put ADMIN_CHAT_ID
```

### 3. Deploy Bot

```bash
npm run deploy
```

### 4. Initialize Topics

Add the bot to your admin group with forum enabled, then run:

```
/start
```

This will:
1. Read consultants from `taxonomy` table
2. Create topics for each consultant
3. Save topic IDs to `settings` table

## 📝 Adding New Consultants

### Option 1: SQL

```sql
-- Add consultant to taxonomy
INSERT INTO taxonomy (entity, name, title, sort_order, created_at, updated_at)
VALUES ('consultant', 'marketing', 'Marketing Expert', 4, datetime('now'), datetime('now'));

-- Add settings
INSERT INTO settings (attribute, value, type, "order", created_at, updated_at)
VALUES 
  ('consultant_marketing_prompt', 'You are a marketing expert...', 'text', 1, datetime('now'), datetime('now')),
  ('consultant_marketing_model', 'gemini-2.5-flash', 'text', 2, datetime('now'), datetime('now')),
  ('consultant_marketing_context_length', '10', 'number', 3, datetime('now'), datetime('now'));
```

### Option 2: Web Interface

Use Payload CMS admin panel to add consultants through the web interface.

### Then Run

```
/start
```

The bot will automatically create topics for new consultants.

## 💬 How It Works

### 1. User sends /start

Bot reads consultants from database and creates topics in admin group.

### 2. User writes to topic

- Bot identifies consultant by topic ID
- Gets prompt and model from settings
- Retrieves conversation history
- Sends request to AI API
- Returns response to topic

### 3. Message Flow

```
User message in topic
  ↓
Bot gets consultant settings
  ↓
Build context from recent messages
  ↓
Send to AI API
  ↓
Wait for response (async)
  ↓
Send AI response to topic
  ↓
Save conversation to database
```

## 🔧 Configuration

### AI API Endpoint

Default: `https://api-gateway-dev.altrp.workers.dev`

Set via `AI_API_URL` environment variable.

### AI Models

Supported models (check your AI API for available ones):
- `gemini-2.5-flash`
- `gpt-4`
- `claude-3-opus`

### Context Length

Controls how many recent messages to include in AI context. Default: 10

Change by updating `consultant_{name}_context_length` in settings table.

## 📊 Monitoring

Check logs:

```bash
npx wrangler tail --format pretty
```

View conversation history:

```sql
SELECT * FROM messages WHERE maid = 'consultant_financier' ORDER BY created_at DESC LIMIT 20;
```

View topic mappings:

```sql
SELECT * FROM message_threads WHERE type = 'consultant';
```

## 🐛 Troubleshooting

### Topics not created

- Check bot has admin rights in group
- Verify group has forum enabled
- Check logs for errors

### AI not responding

- Verify `AI_API_TOKEN` is set correctly
- Check API is accessible
- Review conversation history in DB

### Messages not appearing

- Verify topic exists in database
- Check consultant settings exist
- Review error logs

## 📚 Next Steps

1. Customize prompts for each consultant
2. Add more consultants as needed
3. Monitor AI usage and costs
4. Fine-tune context length for better responses
5. Add logging for analytics



