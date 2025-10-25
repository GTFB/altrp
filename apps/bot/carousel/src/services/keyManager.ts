// Key Management Service for centralized API key handling with rotation
import { PROVIDERS } from '../../settings';

export interface ApiKey {
	id: string;
	name: string;
	provider: string;
	keyValue: string; // Actual API key
	keyType: 'api_key' | 'bearer_token';
	models: string[]; // Array of supported model patterns
	isActive: boolean;
	lastUsed?: number;
	usageCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface KeyUsageStats {
	totalKeys: number;
	activeKeys: number;
	keysByProvider: Record<string, number>;
	mostUsedKey?: string;
	leastUsedKey?: string;
}

export class KeyManagerService {
	constructor(private env: any) {}

	/**
	 * Get the next available key for a specific provider and model
	 * Implements round-robin rotation based on usage statistics
	 */
	async getNextKey(provider: string, model: string): Promise<string> {
		console.log(`[KeyManager] Looking for keys for provider: ${provider}, model: ${model}`);
		
		// Find keys that support the specific model
		const supportedKeys = await this.getKeysForModel(provider, model);
		console.log(`[KeyManager] Found ${supportedKeys.length} supported keys:`, supportedKeys.map(k => ({ id: k.id, name: k.name, models: k.models })));
		
		if (supportedKeys.length === 0) {
			throw new Error(`No keys support model: ${model} for provider: ${provider}`);
		}

		// Select key with least usage (round-robin)
		const selectedKey = supportedKeys.reduce((prev, current) => 
			prev.usageCount < current.usageCount ? prev : current
		);

		console.log(`[KeyManager] Selected key: ${selectedKey.id} (${selectedKey.name})`);

		// Update usage statistics
		await this.updateKeyUsage(selectedKey.id);

		// Get the actual key value from the database record
		const keyValue = await this.getKeyValueFromDatabase(selectedKey);
		console.log(`[KeyManager] Returning key value: ${keyValue.substring(0, 10)}...`);
		
		return keyValue;
	}

	/**
	 * Get all active keys for a specific provider
	 */
	async getActiveKeysForProvider(provider: string): Promise<ApiKey[]> {
		const stmt = this.env.DB.prepare(`
			SELECT * FROM keys 
			WHERE provider = ? AND isActive = 1 
			ORDER BY usageCount ASC, lastUsed ASC
		`);
		
		const result = await stmt.bind(provider).all();
		return result.results.map(this.mapDbRowToApiKey);
	}

	/**
	 * Get keys that support a specific model
	 */
	async getKeysForModel(provider: string, model: string): Promise<ApiKey[]> {
		console.log(`[KeyManager] Querying keys for provider: ${provider}`);
		
		const stmt = this.env.DB.prepare(`
			SELECT * FROM keys 
			WHERE provider = ? AND isActive = 1 
			ORDER BY usageCount ASC, lastUsed ASC
		`);
		
		const result = await stmt.bind(provider).all();
		console.log(`[KeyManager] Raw DB result:`, result);
		
		const allKeys = result.results.map(this.mapDbRowToApiKey);
		console.log(`[KeyManager] All keys for provider ${provider}:`, allKeys.map(k => ({ id: k.id, name: k.name, models: k.models })));
		
		// Filter keys that support the requested model
		const supportedKeys = allKeys.filter(key => 
			key.models.some(pattern => this.matchesModel(model, pattern))
		);
		
		console.log(`[KeyManager] Keys supporting model ${model}:`, supportedKeys.map(k => ({ id: k.id, name: k.name, models: k.models })));
		
		return supportedKeys;
	}

	/**
	 * Add a new API key to the system
	 */
	async addKey(
		name: string, 
		provider: string, 
		keyValue: string, 
		models: string[], 
		keyType: 'api_key' | 'bearer_token' = 'api_key'
	): Promise<string> {
		const keyId = `key-${provider}-${Date.now()}`;
		
		const stmt = this.env.DB.prepare(`
			INSERT INTO keys (id, name, provider, keyValue, keyType, models, isActive, usageCount, createdAt, updatedAt)
			VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
		`);
		
		const now = Math.floor(Date.now() / 1000);
		await stmt.bind(
			keyId,
			name,
			provider,
			keyValue, // Store the actual key value
			keyType,
			JSON.stringify(models),
			now,
			now
		).run();

		return keyId;
	}

	/**
	 * Update key usage statistics
	 */
	async updateKeyUsage(keyId: string): Promise<void> {
		const now = Math.floor(Date.now() / 1000);
		const stmt = this.env.DB.prepare(`
			UPDATE keys 
			SET usageCount = usageCount + 1, lastUsed = ?, updatedAt = ?
			WHERE id = ?
		`);
		
		await stmt.bind(now, now, keyId).run();
	}

	/**
	 * Get usage statistics for all keys
	 */
	async getKeyUsageStats(): Promise<KeyUsageStats> {
		const stmt = this.env.DB.prepare(`
			SELECT 
				provider,
				COUNT(*) as totalKeys,
				SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeKeys,
				MAX(usageCount) as maxUsage,
				MIN(usageCount) as minUsage
			FROM keys 
			GROUP BY provider
		`);
		
		const result = await stmt.all();
		const stats: KeyUsageStats = {
			totalKeys: 0,
			activeKeys: 0,
			keysByProvider: {}
		};

		for (const row of result.results) {
			stats.totalKeys += row.totalKeys;
			stats.activeKeys += row.activeKeys;
			stats.keysByProvider[row.provider] = row.activeKeys;
		}

		return stats;
	}

	/**
	 * Deactivate a key
	 */
	async deactivateKey(keyId: string): Promise<void> {
		const stmt = this.env.DB.prepare(`
			UPDATE keys SET isActive = 0, updatedAt = ? WHERE id = ?
		`);
		
		const now = Math.floor(Date.now() / 1000);
		await stmt.bind(now, keyId).run();
	}

	/**
	 * Check if a model matches a pattern (supports wildcards)
	 */
	private matchesModel(model: string, pattern: string): boolean {
		if (pattern === '*') return true;
		if (pattern.endsWith('*')) {
			return model.startsWith(pattern.slice(0, -1));
		}
		return model === pattern;
	}

	/**
	 * Hash a key for secure storage
	 */
	private async hashKey(key: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(key);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}

	/**
	 * Map database row to ApiKey interface
	 */
	private mapDbRowToApiKey(row: any): ApiKey {
		console.log(`[KeyManager] Mapping DB row:`, row);
		
		return {
			id: row.id,
			name: row.name,
			provider: row.provider,
			keyValue: row.keyValue,
			keyType: row.keyType,
			models: JSON.parse(row.models),
			isActive: Boolean(row.isActive),
			lastUsed: row.lastUsed,
			usageCount: row.usageCount,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		};
	}

	/**
	 * Get actual key value from database
	 * The keyValue field contains the actual API key
	 */
	private async getKeyValueFromDatabase(key: ApiKey): Promise<string> {
		console.log(`[KeyManager] Getting key value for key ${key.id}:`, typeof key.keyValue, key.keyValue);
		
		if (!key.keyValue) {
			throw new Error(`Key value is empty for key: ${key.id}`);
		}
		
		// Return the key value directly from the database record
		return String(key.keyValue);
	}

	/**
	 * Store key in environment for runtime access
	 * This is a placeholder - in real implementation, you'd store
	 * the key in a secure way (e.g., Cloudflare KV or Workers Secrets)
	 */
	private async storeKeyInEnvironment(keyId: string, keyValue: string): Promise<void> {
		// TODO: Implement secure key storage
		console.log(`Storing key ${keyId} in environment`);
	}
}
