# AI Gateway - Smart Serverless AI Gateway

Production-ready AI Gateway built on Cloudflare Workers with support for multiple AI providers, key rotation, and intelligent routing.

## 🚀 Features

- **Multi-Provider Support**: Google Gemini, Groq (GPT, Whisper)
- **Smart Routing**: Text → Gemini, Audio → Whisper
- **Key Rotation**: Automatic load balancing across API keys
- **Rate Limiting**: Per-project request limits
- **Caching**: Intelligent response caching
- **Budget Control**: Monthly spending limits
- **Real-time Monitoring**: Request logging and analytics

## 📁 Project Structure

```
├── src/
│   ├── gate.ts              # Main API endpoints
│   ├── reporter.ts          # Daily analytics reporter
│   ├── utils.ts             # Utility functions
│   ├── middleware/          # Auth, rate limiting
│   ├── services/            # Key rotation, config
│   ├── validators/          # Request validation
│   └── config/              # Dynamic configuration
├── settings.ts              # Centralized configuration
├── schema.sql               # Database schema
├── wrangler.toml            # Cloudflare Worker config
└── Makefile                 # Development commands
```

## 🛠️ Quick Start

1. **Setup**:
   ```bash
   make setup
   make kv-create
   make d1-create
   make d1-migrate
   ```

2. **Configure Secrets**:
   ```bash
   make secret-gemini
   bunx wrangler secret put GROQ_API_KEY_POSTOV
   ```

3. **Deploy**:
   ```bash
   make deploy
   ```

## 📖 API Usage

### Text Generation
```bash
curl -X POST https://your-worker.workers.dev/ask \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"input":"Hello, world!"}'
```

### Audio Transcription
```bash
curl -X POST https://your-worker.workers.dev/upload \
  -H "Authorization: Bearer your-api-key" \
  -F "file=@audio.mp3"
```

### Key Status
```bash
curl -X GET https://your-worker.workers.dev/keys/status \
  -H "Authorization: Bearer your-api-key"
```

## ⚙️ Configuration

All settings are centralized in `settings.ts`:

- **Models**: Available AI models
- **Providers**: Supported AI providers
- **Pricing**: Cost per token/minute
- **Rate Limits**: Request limits
- **API Keys**: Key rotation configuration

## 🔧 Development

```bash
# Local development
make dev

# Type checking
bun run typecheck

# Deploy to production
make deploy
```

## 📊 Monitoring

- **Logs**: Stored in D1 database
- **Analytics**: Daily reports via Telegram
- **Key Rotation**: Tracked in KV store
- **Budget**: Real-time usage monitoring

## 🛡️ Security

- API key hashing (SHA256)
- Rate limiting per project
- Budget controls
- Input validation
- Error handling

## 📈 Performance

- Response caching (15min TTL)
- Asynchronous processing
- Key rotation for load balancing
- Optimized for Cloudflare edge
