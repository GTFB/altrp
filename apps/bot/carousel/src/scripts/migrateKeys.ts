// Migration script to move existing API keys to the new centralized system
import { KeyManagerService } from '../services/keyManager';
import { KEY_MANAGEMENT, PROVIDERS } from '../../settings';

interface MigrationConfig {
	keys: Array<{
		name: string;
		provider: string;
		envVar: string;
		models: readonly string[];
		keyType?: 'api_key' | 'bearer_token';
	}>;
}

export class KeyMigrationService {
	constructor(private env: any) {}

	/**
	 * Migrate all existing keys to the new system
	 */
	async migrateAllKeys(): Promise<void> {
		console.log('Starting key migration...');
		
		const keyManager = new KeyManagerService(this.env);
		const config = this.getMigrationConfig();
		
		let migratedCount = 0;
		let errorCount = 0;

		for (const keyConfig of config.keys) {
			try {
				const keyValue = this.env[keyConfig.envVar];
				
				if (!keyValue) {
					console.warn(`Key ${keyConfig.envVar} not found in environment, skipping...`);
					continue;
				}

				// Check if key already exists in database
				const existingKeys = await keyManager.getActiveKeysForProvider(keyConfig.provider);
				const keyExists = existingKeys.some(key => 
					key.name === keyConfig.name || 
					key.models.some(model => keyConfig.models.includes(model))
				);

				if (keyExists) {
					console.log(`Key ${keyConfig.name} already exists, skipping...`);
					continue;
				}

				// Add key to new system
				await keyManager.addKey(
					keyConfig.name,
					keyConfig.provider,
					keyValue,
					keyConfig.models,
					keyConfig.keyType || 'api_key'
				);

				console.log(`✅ Migrated key: ${keyConfig.name} (${keyConfig.provider})`);
				migratedCount++;

			} catch (error) {
				console.error(`❌ Failed to migrate key ${keyConfig.name}:`, error);
				errorCount++;
			}
		}

		console.log(`\nMigration completed:`);
		console.log(`✅ Successfully migrated: ${migratedCount} keys`);
		console.log(`❌ Failed: ${errorCount} keys`);
	}

	/**
	 * Get migration configuration for existing keys
	 */
	private getMigrationConfig(): MigrationConfig {
		return {
			keys: [
				// Google Gemini keys
				{
					name: 'Google Gemini Key 1',
					provider: PROVIDERS.GOOGLE,
					envVar: 'GOOGLE_API_KEY',
					models: KEY_MANAGEMENT.MODEL_PATTERNS[PROVIDERS.GOOGLE],
					keyType: 'api_key'
				},
				{
					name: 'Google Gemini Key 2 (Orbinin)',
					provider: PROVIDERS.GOOGLE,
					envVar: 'GOOGLE_API_KEY_ORBININ',
					models: KEY_MANAGEMENT.MODEL_PATTERNS[PROVIDERS.GOOGLE],
					keyType: 'api_key'
				},
				
				// Groq keys
				{
					name: 'Groq Key 1',
					provider: PROVIDERS.GROQ,
					envVar: 'GROQ_API_KEY',
					models: KEY_MANAGEMENT.MODEL_PATTERNS[PROVIDERS.GROQ],
					keyType: 'bearer_token'
				},
				{
					name: 'Groq Key 2 (Postov)',
					provider: PROVIDERS.GROQ,
					envVar: 'GROQ_API_KEY_POSTOV',
					models: KEY_MANAGEMENT.MODEL_PATTERNS[PROVIDERS.GROQ],
					keyType: 'bearer_token'
				}
			]
		};
	}

	/**
	 * Verify migration by checking key statistics
	 */
	async verifyMigration(): Promise<void> {
		console.log('\nVerifying migration...');
		
		const keyManager = new KeyManagerService(this.env);
		const stats = await keyManager.getKeyUsageStats();
		
		console.log('Key Statistics:');
		console.log(`Total keys: ${stats.totalKeys}`);
		console.log(`Active keys: ${stats.activeKeys}`);
		console.log('Keys by provider:');
		
		for (const [provider, count] of Object.entries(stats.keysByProvider)) {
			console.log(`  ${provider}: ${count} keys`);
		}
	}

	/**
	 * Rollback migration (deactivate all migrated keys)
	 */
	async rollbackMigration(): Promise<void> {
		console.log('Rolling back migration...');
		
		const keyManager = new KeyManagerService(this.env);
		
		// Get all active keys
		const googleKeys = await keyManager.getActiveKeysForProvider(PROVIDERS.GOOGLE);
		const groqKeys = await keyManager.getActiveKeysForProvider(PROVIDERS.GROQ);
		
		// Deactivate all keys
		for (const key of [...googleKeys, ...groqKeys]) {
			await keyManager.deactivateKey(key.id);
			console.log(`Deactivated key: ${key.name}`);
		}
		
		console.log('Rollback completed');
	}
}

// CLI interface for running migration
export async function runMigration(env: any, command: string = 'migrate'): Promise<void> {
	const migration = new KeyMigrationService(env);
	
	switch (command) {
		case 'migrate':
			await migration.migrateAllKeys();
			await migration.verifyMigration();
			break;
		case 'verify':
			await migration.verifyMigration();
			break;
		case 'rollback':
			await migration.rollbackMigration();
			break;
		default:
			console.log('Available commands: migrate, verify, rollback');
	}
}
