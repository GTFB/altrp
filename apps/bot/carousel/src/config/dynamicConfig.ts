import { DEFAULT_MODELS, RATE_LIMITS, CACHE_SETTINGS } from '../../settings';

export interface DynamicConfig {
	rateLimits: {
		requestsPerMinute: number;
		requestsPerHour: number;
		requestsPerDay: number;
	};
	cache: {
		ttlSeconds: number;
		maxSizeMB: number;
	};
	defaultModels: {
		text: string;
		audio: string;
	};
}

export class ConfigService {
	constructor(private env: any) {}

	async getConfig(): Promise<DynamicConfig> {
		try {
			const configStr = await this.env.PROVIDERS_CONFIG.get('gateway:config');
			if (configStr) {
				return JSON.parse(configStr);
			}
		} catch (error) {
			console.warn('Failed to load dynamic config, using defaults:', error);
		}
		
		// Return default config
		return {
			rateLimits: {
				requestsPerMinute: RATE_LIMITS.REQUESTS_PER_MINUTE,
				requestsPerHour: RATE_LIMITS.REQUESTS_PER_HOUR,
				requestsPerDay: RATE_LIMITS.REQUESTS_PER_DAY
			},
			cache: {
				ttlSeconds: CACHE_SETTINGS.TTL_SECONDS,
				maxSizeMB: CACHE_SETTINGS.MAX_SIZE_MB
			},
			defaultModels: {
				text: DEFAULT_MODELS.TEXT,
				audio: DEFAULT_MODELS.AUDIO
			}
		};
	}

	async updateConfig(config: Partial<DynamicConfig>): Promise<void> {
		const currentConfig = await this.getConfig();
		const updatedConfig = { ...currentConfig, ...config };
		
		await this.env.PROVIDERS_CONFIG.put(
			'gateway:config',
			JSON.stringify(updatedConfig)
		);
	}
}
