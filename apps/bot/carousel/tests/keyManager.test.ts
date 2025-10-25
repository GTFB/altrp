// Tests for KeyManagerService
import { describe, it, expect, beforeEach } from 'bun:test';
import { KeyManagerService } from '../src/services/keyManager';
import { PROVIDERS } from '../src/settings';

// Mock environment
const mockEnv = {
	DB: {
		prepare: (sql: string) => ({
			bind: (...args: any[]) => ({
				all: () => ({ results: [] }),
				run: () => ({ success: true })
			})
		})
	},
	GOOGLE_API_KEY: 'test-google-key-1',
	GOOGLE_API_KEY_ORBININ: 'test-google-key-2',
	GROQ_API_KEY: 'test-groq-key-1',
	GROQ_API_KEY_POSTOV: 'test-groq-key-2'
};

describe('KeyManagerService', () => {
	let keyManager: KeyManagerService;

	beforeEach(() => {
		keyManager = new KeyManagerService(mockEnv);
	});

	it('should create instance', () => {
		expect(keyManager).toBeDefined();
	});

	it('should hash keys correctly', async () => {
		const key = 'test-key-123';
		const hash1 = await (keyManager as any).hashKey(key);
		const hash2 = await (keyManager as any).hashKey(key);
		
		expect(hash1).toBe(hash2);
		expect(hash1).toHaveLength(64); // SHA256 hex length
	});

	it('should match model patterns correctly', () => {
		const matchesModel = (keyManager as any).matchesModel;
		
		expect(matchesModel('gemini-1.5-flash', 'gemini-*')).toBe(true);
		expect(matchesModel('gemini-1.5-pro', 'gemini-*')).toBe(true);
		expect(matchesModel('gpt-3.5-turbo', 'gpt-*')).toBe(true);
		expect(matchesModel('gpt-4', 'gpt-*')).toBe(true);
		expect(matchesModel('gemini-1.5-flash', 'gemini-1.5-flash')).toBe(true);
		expect(matchesModel('gpt-3.5-turbo', 'gemini-*')).toBe(false);
		expect(matchesModel('any-model', '*')).toBe(true);
	});

	it('should map database rows to ApiKey interface', () => {
		const mapDbRowToApiKey = (keyManager as any).mapDbRowToApiKey;
		
		const mockRow = {
			id: 'test-key-1',
			name: 'Test Key',
			provider: 'google',
			keyHash: 'abc123',
			keyType: 'api_key',
			models: '["gemini-*"]',
			isActive: 1,
			lastUsed: 1234567890,
			usageCount: 5,
			createdAt: 1234567890,
			updatedAt: 1234567890
		};

		const result = mapDbRowToApiKey(mockRow);
		
		expect(result).toEqual({
			id: 'test-key-1',
			name: 'Test Key',
			provider: 'google',
			keyHash: 'abc123',
			keyType: 'api_key',
			models: ['gemini-*'],
			isActive: true,
			lastUsed: 1234567890,
			usageCount: 5,
			createdAt: 1234567890,
			updatedAt: 1234567890
		});
	});

	it('should get key from environment correctly', async () => {
		const getKeyFromEnvironment = (keyManager as any).getKeyFromEnvironment;
		
		const mockKey = {
			id: 'key-google-1',
			provider: 'google'
		};

		const result = await getKeyFromEnvironment(mockKey);
		expect(result).toBe('test-google-key-1');
	});

	it('should fallback to provider-based lookup', async () => {
		const getKeyFromEnvironment = (keyManager as any).getKeyFromEnvironment;
		
		const mockKey = {
			id: 'unknown-key-id',
			provider: 'google'
		};

		const result = await getKeyFromEnvironment(mockKey);
		expect(result).toBe('test-google-key-1');
	});
});
