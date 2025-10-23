// AI Gateway Settings
export const PROVIDERS = {
	GOOGLE: 'google',
	GROQ: 'groq'
} as const;

export const MODELS = {
	// Google Gemini models
	GEMINI_FLASH: 'gemini-2.5-flash',
	GEMINI_PRO: 'gemini-2.5-pro',
	
	// Groq models
	GPT_3_5_TURBO: 'gpt-3.5-turbo',
	GPT_4: 'gpt-4',
	GPT_4_TURBO: 'gpt-4-turbo',
	WHISPER_LARGE_V3: 'whisper-large-v3',
} as const;

export const DEFAULT_MODELS = {
	TEXT: MODELS.GEMINI_FLASH,
	AUDIO: MODELS.WHISPER_LARGE_V3
} as const;

export const MODEL_PATTERNS = {
	GEMINI: ['gemini-*'],
	GPT: ['gpt-*', 'openai/gpt-*'],
	WHISPER: ['whisper-*', 'openai/whisper-*']
} as const;

export const PROVIDER_ROUTING = {
	// Audio files always use Groq Whisper
	AUDIO: PROVIDERS.GROQ,
	
	// Text routing rules
	TEXT: {
		[PROVIDERS.GOOGLE]: ['gemini-*'],
		[PROVIDERS.GROQ]: ['gpt-*', 'whisper-*', 'openai/*']
	}
} as const;

export const API_KEYS = {
	GOOGLE: ['GOOGLE_API_KEY', 'GOOGLE_API_KEY_ORBININ'],
	GROQ: ['GROQ_API_KEY', 'GROQ_API_KEY_POSTOV']
} as const;

export const PRICING = {
	[PROVIDERS.GOOGLE]: {
		[MODELS.GEMINI_FLASH]: { input: 0.075, output: 0.30 }, // per 1M tokens
		[MODELS.GEMINI_PRO]: { input: 1.25, output: 5.00 },
	},
	[PROVIDERS.GROQ]: {
		[MODELS.GPT_3_5_TURBO]: { input: 0.0005, output: 0.0015 },
		[MODELS.GPT_4]: { input: 0.03, output: 0.06 },
		[MODELS.WHISPER_LARGE_V3]: { perMinute: 0.006 } // per minute of audio
	}
} as const;

export const RATE_LIMITS = {
	REQUESTS_PER_MINUTE: 60,
	REQUESTS_PER_HOUR: 1000,
	REQUESTS_PER_DAY: 10000
} as const;

export const CACHE_SETTINGS = {
	TTL_SECONDS: 900, // 15 minutes
	MAX_SIZE_MB: 100
} as const;

export const BUDGET_LIMITS = {
	DEFAULT_MONTHLY_USD: 1000,
	WARNING_THRESHOLD: 0.8, // 80% of budget
	EMERGENCY_THRESHOLD: 0.95 // 95% of budget
} as const;

export const PROJECT_TEMPLATES = {
	DEFAULT: {
		name: 'Default Project',
		monthlyBudget: 1000,
		rateLimits: {
			requestsPerMinute: 60,
			requestsPerHour: 1000,
			requestsPerDay: 10000
		},
		allowedModels: ['gemini-*', 'gpt-*', 'whisper-*'],
		features: {
			caching: true,
			analytics: true,
			keyRotation: true
		}
	},
	PREMIUM: {
		name: 'Premium Project',
		monthlyBudget: 5000,
		rateLimits: {
			requestsPerMinute: 200,
			requestsPerHour: 5000,
			requestsPerDay: 50000
		},
		allowedModels: ['gemini-*', 'gpt-*', 'whisper-*', 'openai/*'],
		features: {
			caching: true,
			analytics: true,
			keyRotation: true,
			priority: true
		}
	},
	ENTERPRISE: {
		name: 'Enterprise Project',
		monthlyBudget: 50000,
		rateLimits: {
			requestsPerMinute: 1000,
			requestsPerHour: 25000,
			requestsPerDay: 250000
		},
		allowedModels: ['*'],
		features: {
			caching: true,
			analytics: true,
			keyRotation: true,
			priority: true,
			customModels: true,
			dedicatedKeys: true
		}
	}
} as const;

export const MONITORING = {
	METRICS: {
		REQUEST_COUNT: 'request_count',
		REQUEST_LATENCY: 'request_latency',
		ERROR_RATE: 'error_rate',
		COST_PER_REQUEST: 'cost_per_request',
		KEY_ROTATION: 'key_rotation'
	},
	ALERTS: {
		BUDGET_WARNING: 'budget_warning',
		BUDGET_EXCEEDED: 'budget_exceeded',
		HIGH_ERROR_RATE: 'high_error_rate',
		RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded'
	},
	THRESHOLDS: {
		ERROR_RATE_WARNING: 0.05, // 5%
		ERROR_RATE_CRITICAL: 0.15, // 15%
		LATENCY_WARNING: 5000, // 5 seconds
		LATENCY_CRITICAL: 10000 // 10 seconds
	}
} as const;

export const PERFORMANCE = {
	COMPRESSION: {
		ENABLED: true,
		MIN_SIZE: 1024, // 1KB
		ALGORITHMS: ['gzip', 'deflate', 'brotli']
	},
	CONNECTION_POOLING: {
		ENABLED: true,
		MAX_CONNECTIONS: 100,
		KEEP_ALIVE_TIMEOUT: 30000 // 30 seconds
	},
	CACHE: {
		STRATEGIES: {
			AGGRESSIVE: { ttl: 3600, maxSize: 1000 }, // 1 hour
			BALANCED: { ttl: 900, maxSize: 500 }, // 15 minutes
			CONSERVATIVE: { ttl: 300, maxSize: 100 } // 5 minutes
		}
	}
} as const;

export const SECURITY = {
	CORS: {
		ALLOWED_ORIGINS: ['*'], // Configure for production
		ALLOWED_METHODS: ['GET', 'POST', 'OPTIONS'],
		ALLOWED_HEADERS: ['Authorization', 'Content-Type'],
		MAX_AGE: 86400 // 24 hours
	},
	IP_WHITELIST: {
		ENABLED: false, // Enable for production
		ALLOWED_IPS: [], // Add specific IPs
		BLOCKED_IPS: []
	},
	RATE_LIMITING: {
		STRATEGIES: {
			SLIDING_WINDOW: 'sliding_window',
			FIXED_WINDOW: 'fixed_window',
			TOKEN_BUCKET: 'token_bucket'
		},
		DEFAULT_STRATEGY: 'sliding_window'
	}
} as const;
