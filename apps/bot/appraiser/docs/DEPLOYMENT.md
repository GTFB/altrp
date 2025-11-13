# 🚀 Telegram Bot Deployment Guide for Cloudflare

## 📋 Prerequisites

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn**
3. **Wrangler CLI** - install globally:
   ```bash
   npm install -g wrangler
   ```
4. **Cloudflare account** with access to Workers
5. **Telegram Bot Token** from @BotFather

## All commands are executed from the /apps/bot folder

## You need to create a wrangler.toml file
## For this, you can copy wrangler.toml.example

## Authenticate with cloudflare

```
npx wrangler login
```

## 🔧 Step 1: Configure wrangler.toml

### 1.1 Fill in the configuration
Open the `wrangler.toml` file and replace the placeholders:

```toml
name = "YOUR_WORKER_NAME"           # ← Replace with your bot name
```

**Example:**
```toml
name = "my-telegram-bot"
```

### 1.2 Get Account ID
```bash
npx wrangler whoami
```
Copy the `Account ID` from the command output.

```
account_id = "YOUR_ACCOUNT_ID_HERE" # ← Insert your Account ID
```

**Example:**
```toml
account_id = "1234567890qwertyuioasdfghzxcvbn4"

```

### 1.3 Configure environments (optional)
```toml
[env.development]
name = "YOUR_WORKER_NAME-dev"       # ← For development

[env.production]
name = "YOUR_WORKER_NAME-prod"      # ← For production
```

## 🗄️ Step 2: Create D1 Database

### 2.1 Create a database
```bash
npx wrangler d1 create YOUR_DATABASE_NAME
```

**Example:**
```bash
npx wrangler d1 create my-bot-db
```

### 2.2 Update wrangler.toml
After creation, copy the `database_id` and uncomment the section:

```toml
[[d1_databases]]
binding = "DB"
database_name = "YOUR_DATABASE_NAME"   # ← Insert the name from the previous step
database_id = "YOUR_DATABASE_ID_HERE"  # ← Insert the ID from the previous step
```

### 2.3 Apply database schema
```bash
# For local development
npx wrangler d1 execute YOUR_DATABASE_NAME --local --file=../../migrations/bot/sqlite/0000_schema.sql

# For production
npx wrangler d1 execute YOUR_DATABASE_NAME --file=../../migrations/bot/sqlite/0000_schema.sql --remote
```

## 💾 Step 3: Create KV Namespace

### 3.1 Create KV namespace
```bash
npx wrangler kv namespace create "BOT_KV"
```

### 3.2 Update wrangler.toml
Copy the `id` from the command output:

```toml
[[kv_namespaces]]
binding = "BOT_KV"
id = "YOUR_KV_ID_HERE"              # ← Production ID
```

### 3.3 Create preview namespace:
```bash
   npx wrangler kv namespace create "BOT_KV" --preview
```

### 3.4 Update wrangler.toml:
Copy the `preview_id` from the command output:

```toml
[[kv_namespaces]]
binding = "BOT_KV"
id = "YOUR_KV_ID_HERE"                     # ← Production ID
preview_id = "YOUR_PREVIEW_ID_HERE"        # Preview ID from the command above
```


```toml
[[kv_namespaces]]
binding = "BOT_KV"
id = "YOUR_KV_ID_HERE"              # ← Production ID
preview_id = "YOUR_PREVIEW_KV_ID_HERE" # ← Preview ID
```

## 🗂️ Step 4: Create R2 Storage (optional)

R2 Storage allows you to store user files, generate documents, and create backups.

### 4.1 Create R2 Bucket

```bash
npx wrangler r2 bucket create YOUR_BUCKET_NAME
```

**Example:**
```bash
npx wrangler r2 bucket create my-bot-storage
```

### 4.2 Configure in wrangler.toml

Add R2 configuration to your `wrangler.toml`:

```toml
# R2 Storage
[[r2_buckets]]
binding = "BOT_STORAGE"
bucket_name = "YOUR_BUCKET_NAME"
```

**Example:**
```toml
# R2 Storage
[[r2_buckets]]
binding = "BOT_STORAGE"
bucket_name = "my-bot-storage"
```

### 4.3 R2 Storage Features

- **Store user files** (photos, documents, audio)
- **Generate PDF documents** (invoices, contracts)
- **Create backups** of the database
- **Cache** generated files
- **Static resources** (templates, images)

### 4.4 Usage in code

```typescript
// Save a file
await env.BOT_STORAGE.put(`users/${userId}/file.pdf`, fileData);

// Get a file
const file = await env.BOT_STORAGE.get(`users/${userId}/file.pdf`);

// Create a public link
const publicUrl = `https://pub-${bucketId}.r2.dev/users/${userId}/file.pdf`;
```

## 📦 Step 5: Install dependencies

```bash
npm install --ignore-scripts
```

## 🚀 Step 6: Deploy

```bash
npm run deploy
```

## 🔐 Step 7: Configure secrets

Set the necessary secrets for the bot:

```bash
# Bot token from @BotFather
npx wrangler secret put BOT_TOKEN

# Admin chat ID (where the bot will send notifications)
npx wrangler secret put ADMIN_CHAT_ID

# API token for transcription (optional)
npx wrangler secret put TRANSCRIPTION_API_TOKEN
```

## Or access through the web interface: Compute (Workers) -> "YOUR_WORKER_NAME" -> Settings -> Variables and Secrets -> +Add

Type: Secret
Variable name: BOT_TOKEN
Value: <YOUR_BOT_TOKEN>

## and

Type: Secret
Variable name: ADMIN_CHAT_ID
Value: <YOUR_ADMIN_CHAT_ID>

**How to get ADMIN_CHAT_ID:**
1. Add the bot to a group/channel
2. Send a message in the group
3. Change the group type to a topic-based group
4. Grant the bot administrator rights
5. Go to the link: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
6. Find `chat.id` in the response



## 🔗 Step 8: Configure Webhook

After successful deployment, configure the webhook to receive updates from Telegram.
You can view your worker's URL in the web interface by going to: Compute (Workers) -> "YOUR_WORKER_NAME" -> Settings -> Domains & Routes:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev"}'
```

For example
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://my-telegram-bot.altrp.workers.dev"}'
```

**Replace:**
- `<YOUR_BOT_TOKEN>` - with your bot token
- `YOUR_WORKER_NAME` - with your worker name
- `YOUR_SUBDOMAIN` - with your Cloudflare subdomain

## ✅ Step 9: Verify functionality

1. Send the `/start` command to your bot in Telegram
2. Check the worker logs:
   ```bash
   wrangler tail --format pretty
   ```

## 🛠️ Useful commands

### View logs
```bash
wrangler tail --format pretty
```

### Execute SQL queries
```bash
wrangler d1 execute YOUR_DATABASE_NAME --command "SELECT * FROM users"
```

### Local development
```bash
wrangler dev
```

### View secrets
```bash
wrangler secret list
```

## 🚨 Troubleshooting

### Error "Account ID not found"
- Make sure you are authenticated: `wrangler login`
- Verify the Account ID in `wrangler.toml` is correct

### Error "Database not found"
- Make sure the database is created: `wrangler d1 list`
- Verify the `database_id` in `wrangler.toml` is correct

### Bot not responding
- Check the webhook configuration
- Make sure all secrets are set: `wrangler secret list`
- Check the logs: `wrangler tail`

## 📚 Additional resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**Ready!** 🎉 Your Telegram bot is now ready to deploy on Cloudflare Workers!
