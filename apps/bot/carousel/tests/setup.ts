import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

// Mock Cloudflare environment
export const mockEnv = {
	DB: {
		prepare: (sql: string) => ({
			bind: (...args: any[]) => ({
				first: () => Promise.resolve(null),
				all: () => Promise.resolve({ results: [] }),
				run: () => Promise.resolve({ success: true })
			})
		})
	},
	CACHE: {
		get: (key: string) => Promise.resolve(null),
		put: (key: string, value: string, options?: any) => Promise.resolve()
	},
	PROVIDERS_CONFIG: {
		get: (key: string) => Promise.resolve(null),
		put: (key: string, value: string, options?: any) => Promise.resolve()
	},
	RATE_LIMITS: {
		get: (key: string) => Promise.resolve(null),
		put: (key: string, value: string, options?: any) => Promise.resolve(),
		list: (options: any) => Promise.resolve({ keys: [] })
	},
	GOOGLE_API_KEY: 'test-google-key',
	GROQ_API_KEY: 'test-groq-key'
};

// Test utilities
export const createMockRequest = (method: string, url: string, body?: any, headers?: Record<string, string>) => ({
	method,
	url,
	json: () => Promise.resolve(body),
	header: (name: string) => headers?.[name.toLowerCase()] || null
});

export const createMockContext = (request: any, env = mockEnv) => ({
	req: request,
	env,
	json: (data: any, status = 200) => ({ data, status }),
	text: (data: string, status = 200) => ({ data, status }),
	header: (name: string, value: string) => {},
	set: (key: string, value: any) => {},
	get: (key: string) => null
});
