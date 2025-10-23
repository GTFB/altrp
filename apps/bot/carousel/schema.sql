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

