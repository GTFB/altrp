// Utility to hash API keys for database storage
export async function hashApiKey(key: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(key);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// CLI usage example
if (import.meta.main) {
	const key = process.argv[2];
	if (!key) {
		console.log('Usage: bun run src/utils/hashKey.ts "your-api-key"');
		process.exit(1);
	}
	
	const hash = await hashApiKey(key);
	console.log(`Key: ${key}`);
	console.log(`SHA256: ${hash}`);
}
