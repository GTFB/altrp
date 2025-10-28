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
	isValid: boolean; // Key validity status
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
	 * Get the next available key for a specific model
	 * Implements round-robin rotation based on creation order
	 */
	async getNextKey(provider: string, model: string): Promise<{ key: string; keyId: string }> {
		console.log(`[KeyManager] Looking for keys for model: ${model}`);
		
		// Find keys that support the specific model
		const supportedKeys = await this.getKeysForModel(provider, model);
		console.log(`[KeyManager] Found ${supportedKeys.length} supported keys:`, supportedKeys.map(k => ({ id: k.id, name: k.name, provider: k.provider, isActive: k.isActive, createdAt: k.createdAt })));
		
		if (supportedKeys.length === 0) {
			throw new Error(`No keys support model: ${model}`);
		}

		// Keys are already sorted by createdAt in getKeysForModel
		const sortedKeys = supportedKeys;
		console.log(`[KeyManager] Sorted keys by createdAt:`, sortedKeys.map(k => ({ id: k.id, name: k.name, provider: k.provider, isActive: k.isActive, createdAt: k.createdAt })));

		// Find current active key
		const currentActiveKey = sortedKeys.find(key => key.isActive);
		console.log(`[KeyManager] Current active key:`, currentActiveKey ? { id: currentActiveKey.id, name: currentActiveKey.name, provider: currentActiveKey.provider } : 'None');

		// Find next key in rotation
		let selectedKey: ApiKey;
		if (currentActiveKey) {
			const currentIndex = sortedKeys.findIndex(key => key.id === currentActiveKey.id);
			const nextIndex = (currentIndex + 1) % sortedKeys.length;
			selectedKey = sortedKeys[nextIndex];
		} else {
			// No active key, start with the first one
			selectedKey = sortedKeys[0];
		}

		console.log(`[KeyManager] Selected key for rotation: ${selectedKey.id} (${selectedKey.name}) from provider: ${selectedKey.provider}`);

		// Update key statuses: new key = active, others = inactive
		await this.rotateToKey(selectedKey.id, supportedKeys);

		// Update usage statistics
		await this.updateKeyUsage(selectedKey.id);

		// Get the actual key value from the database record
		const keyValue = await this.getKeyValueFromDatabase(selectedKey);
		console.log(`[KeyManager] Returning key value: ${keyValue.substring(0, 10)}...`);
		
		return { key: keyValue, keyId: selectedKey.id };
	}

	/**
	 * Get all active keys for a specific provider
	 */
	async getActiveKeysForProvider(provider: string): Promise<ApiKey[]> {
		const stmt = this.env.DB.prepare(`
			SELECT * FROM keys 
			WHERE JSON_EXTRACT(data_in, '$.provider') = ? AND is_active = 1 
			ORDER BY JSON_EXTRACT(data_in, '$.usageCount') ASC, JSON_EXTRACT(data_in, '$.lastUsed') ASC
		`);
		
		const result = await stmt.bind(provider).all();
		return result.results.map(this.mapDbRowToApiKey);
	}

	/**
	 * Get keys that support a specific model
	 */
	async getKeysForModel(provider: string, model: string): Promise<ApiKey[]> {
		console.log(`[KeyManager] Querying keys for model: ${model}`);
		
		// Get ALL keys (not just active ones) and filter by model support
		const stmt = this.env.DB.prepare(`
			SELECT * FROM keys 
			WHERE JSON_EXTRACT(data_in, '$.provider') = ?
			ORDER BY created_at ASC
		`);
		
		const result = await stmt.bind(provider).all();
		console.log(`[KeyManager] Raw DB result:`, result);
		
		const allKeys = result.results.map(this.mapDbRowToApiKey);
		console.log(`[KeyManager] All keys:`, allKeys.map((k: ApiKey) => ({ id: k.id, name: k.name, provider: k.provider, isActive: k.isActive, isValid: k.isValid, models: k.models })));
		
		// Filter keys that support the requested model AND are valid
		const supportedKeys = allKeys.filter((key: ApiKey) => 
			key.isValid && key.models.some(pattern => this.matchesModel(model, pattern))
		);
		
		console.log(`[KeyManager] Valid keys supporting model ${model}:`, supportedKeys.map((k: ApiKey) => ({ id: k.id, name: k.name, provider: k.provider, isActive: k.isActive, isValid: k.isValid, models: k.models })));
		
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
			SET data_in = json_set(
				data_in, 
				'$.usageCount', COALESCE(JSON_EXTRACT(data_in, '$.usageCount'), 0) + 1,
				'$.lastUsed', ?
			),
			updated_at = datetime('now')
			WHERE id = ? OR kaid = ?
		`);
		
		await stmt.bind(now, keyId, keyId).run();
	}

	/**
	 * Rotate to a specific key: set it as active, others as inactive
	 */
	async rotateToKey(activeKeyId: string, allKeys: ApiKey[]): Promise<void> {
		console.log(`[KeyManager] Rotating to key: ${activeKeyId}`);
		
		// Set all keys as inactive first
		const allKeyIds = allKeys.map(key => key.id);
		if (allKeyIds.length > 0) {
			const placeholders = allKeyIds.map(() => '?').join(',');
			const stmt = this.env.DB.prepare(`
				UPDATE keys 
				SET is_active = 0, updated_at = datetime('now')
				WHERE id IN (${placeholders}) OR kaid IN (${placeholders})
			`);
			
			await stmt.bind(...allKeyIds, ...allKeyIds).run();
		}
		
		// Set the selected key as active
		const stmt = this.env.DB.prepare(`
			UPDATE keys 
			SET is_active = 1, updated_at = datetime('now')
			WHERE id = ? OR kaid = ?
		`);
		
		await stmt.bind(activeKeyId, activeKeyId).run();
		
		console.log(`[KeyManager] Key ${activeKeyId} is now active, others are inactive`);
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
	 * Mark a key as invalid (when API returns authentication error)
	 */
	async markKeyAsInvalid(keyId: string): Promise<void> {
		console.log(`[KeyManager] Marking key ${keyId} as invalid`);
		
		const stmt = this.env.DB.prepare(`
			UPDATE keys 
			SET data_in = json_set(data_in, '$.isValid', 0),
				is_active = 0,
				updated_at = datetime('now')
			WHERE id = ? OR kaid = ?
		`);
		
		await stmt.bind(keyId, keyId).run();
		
		console.log(`[KeyManager] Key ${keyId} marked as invalid`);
	}

	/**
	 * Mark a key as valid (when API call succeeds)
	 */
	async markKeyAsValid(keyId: string): Promise<void> {
		console.log(`[KeyManager] Marking key ${keyId} as valid`);
		
		const stmt = this.env.DB.prepare(`
			UPDATE keys 
			SET data_in = json_set(data_in, '$.isValid', 1),
				updated_at = datetime('now')
			WHERE id = ? OR kaid = ?
		`);
		
		await stmt.bind(keyId, keyId).run();
		
		console.log(`[KeyManager] Key ${keyId} marked as valid`);
	}

	/**
	 * Get next valid key with automatic rotation on invalid keys
	 * Tries all available keys until finds a valid one
	 */
	async getNextValidKey(provider: string, model: string): Promise<{ key: string; keyId: string }> {
		console.log(`[KeyManager] Getting next valid key for model: ${model}`);
		
		// Use the regular getNextKey method which handles rotation properly
		return await this.getNextKey(provider, model);
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
		
		// Parse data_in JSON
		let dataIn = {};
		try {
			dataIn = JSON.parse(row.data_in || '{}');
		} catch (e) {
			console.error('Failed to parse data_in:', e);
		}
		
		return {
			id: row.id?.toString() || row.kaid,
			name: row.title || '',
			provider: dataIn['provider'] || '',
			keyValue: dataIn['keyValue'] || '',
			keyType: dataIn['keyType'] || 'api_key',
			models: JSON.parse(dataIn['models'] || '[]'),
			isActive: Boolean(row.is_active),
			isValid: Boolean(dataIn['isValid']),
			lastUsed: dataIn['lastUsed'],
			usageCount: dataIn['usageCount'] || 0,
			createdAt: new Date(row.created_at).getTime() / 1000,
			updatedAt: new Date(row.updated_at).getTime() / 1000
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
