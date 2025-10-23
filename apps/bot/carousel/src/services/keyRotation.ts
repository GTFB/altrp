import { API_KEYS } from '../../settings';

export class KeyRotationService {
	constructor(private env: any) {}

	async getNextGoogleKey(projectId: string): Promise<string> {
		const keyIndexKey = `key_rotation:${projectId}:google`;
		const currentIndex = await this.env.RATE_LIMITS.get(keyIndexKey) || '0';
		const index = parseInt(currentIndex, 10);
		
		const googleKeys = API_KEYS.GOOGLE.map(keyName => this.env[keyName]).filter(Boolean);
		
		if (googleKeys.length === 0) {
			throw new Error('No Google API keys available');
		}
		
		const selectedKey = googleKeys[index % googleKeys.length];
		
		// Rotate to next key
		await this.env.RATE_LIMITS.put(keyIndexKey, String((index + 1) % googleKeys.length), { expirationTtl: 86400 });
		
		return selectedKey;
	}

	async getNextGroqKey(projectId: string): Promise<string> {
		const keyIndexKey = `key_rotation:${projectId}:groq`;
		const currentIndex = await this.env.RATE_LIMITS.get(keyIndexKey) || '0';
		const index = parseInt(currentIndex, 10);
		
		const groqKeys = API_KEYS.GROQ.map(keyName => this.env[keyName]).filter(Boolean);
		
		if (groqKeys.length === 0) {
			throw new Error('No Groq API keys available');
		}
		
		const selectedKey = groqKeys[index % groqKeys.length];
		
		// Rotate to next key
		await this.env.RATE_LIMITS.put(keyIndexKey, String((index + 1) % groqKeys.length), { expirationTtl: 86400 });
		
		return selectedKey;
	}
}
