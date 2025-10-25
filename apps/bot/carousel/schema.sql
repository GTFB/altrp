-- D1 schema for AI Gateway
CREATE TABLE IF NOT EXISTS logs (
	id TEXT PRIMARY KEY,
	projectId TEXT,
	status TEXT,
	provider TEXT,
	model TEXT,
	cost REAL,
	promptTokens INTEGER,
	completionTokens INTEGER,
	latencyMs INTEGER,
	requestBody TEXT,
	responseBody TEXT,
	createdAt INTEGER
);

CREATE TABLE IF NOT EXISTS projects (
	id TEXT PRIMARY KEY,
	name TEXT,
	apiKeyHash TEXT,
	monthlyBudget REAL,
	currentUsage REAL
);

CREATE TABLE IF NOT EXISTS project_permissions (
	projectId TEXT,
	modelPattern TEXT
);

-- Optional mapping of projects to provider key aliases (for multiple keys per provider)
CREATE TABLE IF NOT EXISTS project_provider_keys (
	projectId TEXT,
	provider TEXT,
	keyAlias TEXT
);

-- Centralized API keys management with rotation support
CREATE TABLE IF NOT EXISTS keys (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	provider TEXT NOT NULL,
	keyValue TEXT NOT NULL, -- Actual API key (open for development)
	keyType TEXT NOT NULL DEFAULT 'api_key',
	models TEXT NOT NULL, -- JSON array of supported models (e.g., ["gemini-*", "gpt-*"])
	isActive BOOLEAN DEFAULT 1,
	isValid BOOLEAN DEFAULT 1, -- Key validity status (0 = invalid, 1 = valid)
	lastUsed INTEGER,
	usageCount INTEGER DEFAULT 0,
	createdAt INTEGER DEFAULT (strftime('%s', 'now')),
	updatedAt INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_keys_provider ON keys(provider);
CREATE INDEX IF NOT EXISTS idx_keys_active ON keys(isActive);
CREATE INDEX IF NOT EXISTS idx_keys_usage ON keys(usageCount, lastUsed);

