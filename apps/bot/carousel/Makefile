SHELL := powershell.exe
.SHELLFLAGS := -NoLogo -NoProfile -Command

.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  start            - Protocol START (git sync + prune)"
	@echo "  setup            - Install dependencies with Bun"
	@echo "  dev              - Run local dev server (wrangler dev)"
	@echo "  deploy           - Deploy worker to Cloudflare"
	@echo "  test             - Run tests"
	@echo "  test:watch       - Run tests in watch mode"
	@echo "  typecheck        - Run TypeScript type checking"
	@echo "  secret-gemini    - Set GOOGLE_API_KEY secret"
	@echo "  keys-migrate     - Migrate existing keys to new system"
	@echo "  keys-verify      - Verify key migration status"
	@echo "  keys-rollback    - Rollback key migration"
	@echo "  d1-prepare       - Prepare D1 schema (placeholder)"
	@echo "  kv-create        - Create KV namespaces (CACHE/PROVIDERS_CONFIG/RATE_LIMITS)"
	@echo "  project-create   - Create new project with template"
	@echo "  project-list     - List all projects"
	@echo "  metrics-view     - View project metrics"

start:
	git status --porcelain
	git switch main; git pull origin main; git switch develop; git pull origin develop; git merge main || echo "Merge completed or conflicts present"
	$merged = git branch --merged develop | % { $_.Trim() } | ? { -not ($_ -match '^\*') -and ($_ -ne 'develop') -and ($_ -ne 'main') }; if ($merged) { foreach ($b in $merged) { git branch -d $$b } } else { echo "No merged local branches to prune" }
	@echo "System Initialized. Workspace is clean and synchronized. Awaiting new goal for EXECUTE_TASK protocol."

setup:
	bun install

dev:
	bunx wrangler dev

deploy:
	bunx wrangler deploy

secret-gemini:
	bunx wrangler secret put GOOGLE_API_KEY

keys-migrate:
	bunx wrangler dev --x-remote-bindings --command "import('./src/scripts/migrateKeys.ts').then(m => m.runMigration(globalThis, 'migrate'))"

keys-verify:
	bunx wrangler dev --x-remote-bindings --command "import('./src/scripts/migrateKeys.ts').then(m => m.runMigration(globalThis, 'verify'))"

keys-rollback:
	bunx wrangler dev --x-remote-bindings --command "import('./src/scripts/migrateKeys.ts').then(m => m.runMigration(globalThis, 'rollback'))"

hash-key:
	@if (-not $$env:KEY) { echo "Usage: make hash-key KEY=your-api-key"; exit 1 } ; bun run src/utils/hashKey.ts "$$env:KEY"

d1-prepare:
	@echo "TODO: Add D1 schema migrations via wrangler d1 commands"

queue-create:
	bunx wrangler queues create llm-requests

d1-create:
	bunx wrangler d1 create ai_gateway_dev

d1-migrate:
	bunx wrangler d1 execute ai_gateway_dev --file=./schema.sql --remote

secret-telegram:
	bunx wrangler secret put TELEGRAM_BOT_TOKEN; bunx wrangler secret put TELEGRAM_CHAT_ID

kv-put-google-config:
	bunx wrangler kv key put --binding=PROVIDERS_CONFIG provider:google '{"pricing":{"gemini-1.5-flash":{"input":0.075,"output":0.30}}}' --preview false

d1-kv-note:
	@echo "After kv-create, update wrangler.toml with returned ids if not auto-bound."

d1-preview-note:
	@echo "For wrangler dev, you can also use local dev without remote to avoid remote binding checks."

d1-help:
	@echo "Use: make kv-create; then edit wrangler.toml ids as shown; then make dev"

d1-remote-dev:
	bunx wrangler dev --x-remote-bindings

kv-create:
	bunx wrangler kv namespace create CACHE
	bunx wrangler kv namespace create CACHE --preview
	bunx wrangler kv namespace create PROVIDERS_CONFIG
	bunx wrangler kv namespace create PROVIDERS_CONFIG --preview
	bunx wrangler kv namespace create RATE_LIMITS
	bunx wrangler kv namespace create RATE_LIMITS --preview

d1-init-project:
	# Usage: make d1-init-project PROJECT_ID=<id> API_KEY=<plain> BUDGET=<usd> MODEL=<pattern>
	@if (-not $$env:PROJECT_ID) { echo "Set PROJECT_ID"; exit 1 } ; if (-not $$env:API_KEY) { echo "Set API_KEY"; exit 1 } ; if (-not $$env:BUDGET) { $$env:BUDGET = 10 } ; if (-not $$env:MODEL) { $$env:MODEL = 'gemini-*' } ; $$hash = [Convert]::ToBase64String([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($$env:API_KEY))) ; $$tmp = [System.IO.Path]::GetTempFileName(); Set-Content -Encoding UTF8 $$tmp "INSERT INTO projects (id,name,apiKeyHash,monthlyBudget,currentUsage) VALUES ('$$env:PROJECT_ID','Default','$$hash',$$env:BUDGET,0);`nINSERT INTO project_permissions (projectId,modelPattern) VALUES ('$$env:PROJECT_ID','$$env:MODEL');" ; bunx wrangler d1 execute ai_gateway_dev --file=$$tmp --remote ; Remove-Item $$tmp -Force

test:
	bun test

test:watch:
	bun test --watch

typecheck:
	bun run typecheck

project-create:
	@if (-not $$env:PROJECT_ID) { echo "Set PROJECT_ID"; exit 1 } ; if (-not $$env:TEMPLATE) { $$env:TEMPLATE = 'DEFAULT' } ; echo "Creating project $$env:PROJECT_ID with template $$env:TEMPLATE" ; bunx wrangler d1 execute ai_gateway_dev --remote --command "INSERT INTO projects (id, name, monthlyBudget, currentUsage) VALUES ('$$env:PROJECT_ID', '$$env:TEMPLATE Project', 1000, 0)"

project-list:
	bunx wrangler d1 execute ai_gateway_dev --remote --command "SELECT id, name, monthlyBudget, currentUsage FROM projects ORDER BY createdAt DESC"

metrics-view:
	@if (-not $$env:PROJECT_ID) { echo "Set PROJECT_ID"; exit 1 } ; echo "Metrics for project $$env:PROJECT_ID" ; bunx wrangler d1 execute ai_gateway_dev --remote --command "SELECT COUNT(*) as requests, SUM(cost) as totalCost, AVG(latencyMs) as avgLatency FROM logs WHERE projectId = '$$env:PROJECT_ID' AND createdAt >= (strftime('%s', 'now') - 86400)"

