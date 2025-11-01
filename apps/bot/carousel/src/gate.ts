import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { genId, matchesModel, sha256, sha256Base64 } from './utils';
import { 
	PROVIDERS, 
	MODELS, 
	DEFAULT_MODELS, 
	MODEL_PATTERNS, 
	PROVIDER_ROUTING, 
	API_KEYS, 
	KEY_MANAGEMENT,
	PRICING, 
	RATE_LIMITS, 
	CACHE_SETTINGS 
} from '../settings';
import { KeyManagerService } from './services/keyManager';

// Enhanced key rotation functions with new centralized system and fallback
async function getNextGoogleKey(env: Env, projectId: string): Promise<{ key: string; keyId?: string }> {
	// Try new centralized key management system first
	if (KEY_MANAGEMENT.ENABLED) {
		try {
			const keyManager = new KeyManagerService(env);
			return await keyManager.getNextKey(PROVIDERS.GOOGLE, 'gemini-*');
		} catch (error) {
			console.warn('New key management failed, falling back to legacy system:', error);
			if (!KEY_MANAGEMENT.FALLBACK_TO_LEGACY) {
				throw error;
			}
		}
	}

	// Legacy key rotation system (fallback)
	const keyIndexKey = `key_rotation:${projectId}:google`;
	const currentIndex = await env.RATE_LIMITS.get(keyIndexKey) || '0';
	const index = parseInt(currentIndex, 10);
	
	const googleKeys = API_KEYS.GOOGLE.map(keyName => (env as any)[keyName]).filter(Boolean);
	
	if (googleKeys.length === 0) {
		throw new Error('No Google API keys available');
	}
	
	const selectedKey = googleKeys[index % googleKeys.length];
	
	// Rotate to next key
	await env.RATE_LIMITS.put(keyIndexKey, String((index + 1) % googleKeys.length), { expirationTtl: 86400 });
	
	return { key: selectedKey };
}

async function getNextGroqKey(env: Env, projectId: string, model: string = 'whisper-large-v3'): Promise<string> {
	// Try new centralized key management system first
	if (KEY_MANAGEMENT.ENABLED) {
		try {
			const keyManager = new KeyManagerService(env);
			const result = await keyManager.getNextKey(PROVIDERS.GROQ, model);
			return result.key;
		} catch (error) {
			console.warn('New key management failed, falling back to legacy system:', error);
			if (!KEY_MANAGEMENT.FALLBACK_TO_LEGACY) {
				throw error;
			}
		}
	}

	// Legacy key rotation system (fallback)
	const keyIndexKey = `key_rotation:${projectId}:groq`;
	const currentIndex = await env.RATE_LIMITS.get(keyIndexKey) || '0';
	const index = parseInt(currentIndex, 10);
	
	const groqKeys = API_KEYS.GROQ.map(keyName => (env as any)[keyName]).filter(Boolean);
	
	if (groqKeys.length === 0) {
		throw new Error('No Groq API keys available');
	}
	
	const selectedKey = groqKeys[index % groqKeys.length];
	
	// Rotate to next key
	await env.RATE_LIMITS.put(keyIndexKey, String((index + 1) % groqKeys.length), { expirationTtl: 86400 });
	
	return selectedKey;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import reporter from './reporter';

export interface Env {
	GOOGLE_API_KEY: string;
	GOOGLE_API_KEY_ORBININ: string;
	GROQ_API_KEY: string;
	GROQ_API_KEY_POSTOV: string;
	DB: D1Database;
	CACHE: KVNamespace;
	PROVIDERS_CONFIG: KVNamespace;
	RATE_LIMITS: KVNamespace;
    USE_LOCAL_ASYNC?: string;
}

type AskBody = {
	model: string;
	input?: string;
	messages?: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>;
	stream?: boolean;
	audio?: string; // base64 encoded audio data
	audioFormat?: string; // mp3, wav, etc.
};

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true }));

// Get result by requestId
app.get('/result/:requestId', async (c) => {
	const requestId = c.req.param('requestId');
	if (!requestId) return c.json({ error: 'RequestId required' }, 400);

	// Auth
	const auth = c.req.header('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	if (!token) return c.json({ error: 'Unauthorized' }, 401);
	const tokenHash = await sha256Base64(token);
	const project = await c.env.DB.prepare(
		`SELECT daid as id FROM deals WHERE JSON_EXTRACT(data_in, '$.apiKeyHash') = ? LIMIT 1`
	).bind(tokenHash).first<{ id: string }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Get result from database
	const result = await c.env.DB.prepare(
		`SELECT 
			JSON_EXTRACT(details, '$.status') as status,
			JSON_EXTRACT(details, '$.provider') as provider,
			model_name as model,
			JSON_EXTRACT(details, '$.cost') as cost,
			JSON_EXTRACT(details, '$.promptTokens') as promptTokens,
			JSON_EXTRACT(details, '$.completionTokens') as completionTokens,
			JSON_EXTRACT(details, '$.latencyMs') as latencyMs,
			JSON_EXTRACT(details, '$.requestBody') as requestBody,
			JSON_EXTRACT(details, '$.responseBody') as responseBody,
			created_at as createdAt
		FROM journal_generations 
		WHERE full_maid = ? AND JSON_EXTRACT(details, '$.original_projectId') = ? 
		LIMIT 1`
	).bind(requestId, project.id).first<{
		status: string;
		provider: string;
		model: string;
		cost: number;
		promptTokens: number;
		completionTokens: number;
		latencyMs: number;
		requestBody: string;
		responseBody: string;
		createdAt: number;
	}>();

	if (!result) {
		return c.json({ error: 'Request not found' }, 404);
	}

	// Parse response body
	let responseData;
	try {
		responseData = JSON.parse(result.responseBody);
	} catch {
		responseData = { content: result.responseBody };
	}

	return c.json({
		requestId,
		status: result.status,
		provider: result.provider,
		model: result.model,
		cost: result.cost,
		promptTokens: result.promptTokens,
		completionTokens: result.completionTokens,
		latencyMs: result.latencyMs,
		createdAt: result.createdAt,
		content: responseData.content || responseData.text || '',
		error: result.status === 'ERROR' ? responseData.error || responseData.content : null
	});
});

// Get request status by requestId
app.get('/status/:requestId', async (c) => {
	const requestId = c.req.param('requestId');
	if (!requestId) return c.json({ error: 'RequestId required' }, 400);

	// Auth
	const auth = c.req.header('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	if (!token) return c.json({ error: 'Unauthorized' }, 401);
	const tokenHash = await sha256Base64(token);
	const project = await c.env.DB.prepare(
		`SELECT daid as id FROM deals WHERE JSON_EXTRACT(data_in, '$.apiKeyHash') = ? LIMIT 1`
	).bind(tokenHash).first<{ id: string }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Check if request exists in database
	const result = await c.env.DB.prepare(
		`SELECT 
			JSON_EXTRACT(details, '$.status') as status,
			created_at as createdAt
		FROM journal_generations 
		WHERE full_maid = ? AND JSON_EXTRACT(details, '$.original_projectId') = ? 
		LIMIT 1`
	).bind(requestId, project.id).first<{
		status: string;
		createdAt: number;
	}>();

	if (!result) {
		return c.json({ 
			requestId,
			status: 'PENDING',
			message: 'Request is being processed or not found'
		});
	}

	return c.json({
		requestId,
		status: result.status,
		createdAt: result.createdAt,
		message: result.status === 'SUCCESS' ? 'Request completed successfully' : 
		         result.status === 'ERROR' ? 'Request failed' : 'Request is being processed'
	});
});

// Key rotation status endpoint
app.get('/keys/status', async (c) => {
	// Auth
	const auth = c.req.header('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	if (!token) return c.json({ error: 'Unauthorized' }, 401);
	const tokenHash = await sha256Base64(token);
	const project = await c.env.DB.prepare(
		`SELECT daid as id FROM deals WHERE JSON_EXTRACT(data_in, '$.apiKeyHash') = ? LIMIT 1`
	).bind(tokenHash).first<{ id: string }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Get current key indices
	const googleIndex = await c.env.RATE_LIMITS.get(`key_rotation:${project.id}:google`) || '0';
	const groqIndex = await c.env.RATE_LIMITS.get(`key_rotation:${project.id}:groq`) || '0';

	return c.json({
		projectId: project.id,
		google: {
			currentIndex: parseInt(googleIndex, 10),
			totalKeys: API_KEYS.GOOGLE.length,
			keys: API_KEYS.GOOGLE
		},
		groq: {
			currentIndex: parseInt(groqIndex, 10),
			totalKeys: API_KEYS.GROQ.length,
			keys: API_KEYS.GROQ
		}
	});
});

app.use('*', cors());

// File upload endpoint for audio files
app.post('/upload', async (c) => {
	// Auth: simple API key in Authorization: Bearer <key>
	const auth = c.req.header('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	if (!token) return c.json({ error: 'Unauthorized' }, 401);
	const tokenHash = await sha256Base64(token);
	const project = await c.env.DB.prepare(
		`SELECT 
			daid as id,
			JSON_EXTRACT(data_in, '$.monthlyBudget') as monthlyBudget,
			JSON_EXTRACT(data_in, '$.currentUsage') as currentUsage
		FROM deals WHERE JSON_EXTRACT(data_in, '$.apiKeyHash') = ? LIMIT 1`
	).bind(tokenHash).first<{ id: string; monthlyBudget: number; currentUsage: number }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Get model from query parameter
	const model = c.req.query('model') || DEFAULT_MODELS.AUDIO;
	
	// Check permissions
	const perm = await c.env.DB.prepare(
		`SELECT 1 FROM identities 
		WHERE entity_aid = ? AND ? LIKE REPLACE(permission, "*", "%") 
		LIMIT 1`
	).bind(project.id, model).first();
	if (!perm) return c.json({ error: 'Forbidden' }, 403);

	// Budget check
	if ((project.currentUsage ?? 0) >= (project.monthlyBudget ?? 0)) {
		return c.json({ error: 'Budget exceeded' }, 402);
	}

	// Rate limit
	const rlKey = `rl:${project.id}:${Math.floor(Date.now() / 60000)}`;
	const countStr = await c.env.RATE_LIMITS.get(rlKey);
	const count = countStr ? parseInt(countStr, 10) : 0;
	if (count >= RATE_LIMITS.REQUESTS_PER_MINUTE) return c.json({ error: 'Too Many Requests' }, 429);
	await c.env.RATE_LIMITS.put(rlKey, String(count + 1), { expirationTtl: 120 });

	try {
		const formData = await c.req.formData();
		const file = formData.get('file') as File;
		
		if (!file) {
			return c.json({ error: 'No file provided' }, 400);
		}

		// Convert file to base64
		const arrayBuffer = await file.arrayBuffer();
		const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
		
		// Get file extension
		const fileName = file.name || 'audio';
		const fileExt = fileName.split('.').pop()?.toLowerCase() || 'mp3';

		// Check cache by file hash
		const fileHash = await sha256Base64(base64);
		const cacheKey = `resp:${model}:${fileHash}`;
		const cached = await c.env.CACHE.get(cacheKey);
		
		if (cached) {
			const cachedData = JSON.parse(cached);
			return c.json({
				requestId: cachedData.requestId,
				content: cachedData.content
			});
		}

		// Generate requestId
		const requestId = genId('req');
		
		// Process synchronously
		const t0 = Date.now();
		let status = 'SUCCESS';
		let text = '';
		let cost = 0;
		
		try {
			// Call Whisper with key rotation
			const out = await callWhisperWithKeyRotation(c.env, project.id, base64, fileExt);
			text = out.text;
			
			// Calculate cost (Whisper pricing is per minute)
			const audioDuration = 60; // rough estimate, could be improved
			cost = audioDuration * 0.006; // $0.006 per minute for Whisper
			
		} catch (e) {
			status = 'ERROR';
			text = String(e);
			console.error(`Whisper API error for request ${requestId}:`, e);
		}
		
		const latency = Date.now() - t0;
		
		// Log to database
		const detailsJson = JSON.stringify({
			status,
			provider: 'groq',
			cost,
			promptTokens: 0, // audio
			completionTokens: text.split(/\s+/).length,
			latencyMs: latency,
			requestBody: { model, audioFormat: fileExt },
			responseBody: { content: text },
			original_log_id: requestId,
			original_projectId: project.id
		});
		
		await c.env.DB.prepare(
			`INSERT INTO journal_generations 
			(uuid, full_maid, model_name, status, token_in, token_out, total_token, details, created_at, updated_at) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			crypto.randomUUID(), // uuid
			requestId, // full_maid
			model,
			status,
			0,
			text.split(/\s+/).length,
			text.split(/\s+/).length,
			detailsJson
		).run();

		// Update project usage
		await c.env.DB.prepare(
			`UPDATE deals 
			SET data_in = json_set(data_in, '$.currentUsage', CAST(JSON_EXTRACT(data_in, '$.currentUsage') AS REAL) + ?)
			WHERE daid = ?`
		).bind(cost, project.id).run();

		console.log('Processed audio file', requestId, 'status', status, 'latency', latency);

		// Cache the result
		if (status === 'SUCCESS') {
			await c.env.CACHE.put(cacheKey, JSON.stringify({ requestId, model, content: text }), { expirationTtl: CACHE_SETTINGS.TTL_SECONDS });
		}
		
		// Return with requestId only
		return c.json({ 
			requestId: requestId
		});

	} catch (error) {
		console.error('File upload error:', error);
		return c.json({ error: 'File processing failed' }, 500);
	}
});

// Producer: auth, budgets, permissions, rate-limit, cache, enqueue
app.post('/ask', async (c) => {
	let body: AskBody;
	try {
		body = await c.req.json<AskBody>();
	} catch {
		return c.json({ error: 'Invalid JSON' }, 400);
	}

	if (!body.input && !body.messages && !body.audio) {
		return c.json({ error: 'Provide input, messages, or audio' }, 400);
	}

	// Auth: simple API key in Authorization: Bearer <key>
	const auth = c.req.header('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	if (!token) return c.json({ error: 'Unauthorized' }, 401);
	const tokenHash = await sha256Base64(token);
	const project = await c.env.DB.prepare(
		`SELECT 
			daid as id,
			JSON_EXTRACT(data_in, '$.monthlyBudget') as monthlyBudget,
			JSON_EXTRACT(data_in, '$.currentUsage') as currentUsage
		FROM deals WHERE JSON_EXTRACT(data_in, '$.apiKeyHash') = ? LIMIT 1`
	).bind(tokenHash).first<{ id: string; monthlyBudget: number; currentUsage: number }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	const model = body.model || DEFAULT_MODELS.TEXT;

	// Permissions
	const perm = await c.env.DB.prepare(
		`SELECT 1 FROM identities 
		WHERE entity_aid = ? AND ? LIKE REPLACE(permission, "*", "%") 
		LIMIT 1`
	).bind(project.id, model).first();
	if (!perm) return c.json({ error: 'Forbidden' }, 403);

	// Budget
	if ((project.currentUsage ?? 0) >= (project.monthlyBudget ?? 0)) {
		return c.json({ error: 'Budget exceeded' }, 402);
	}

	// Rate limit (KV simple window)
	const rlKey = `rl:${project.id}:${Math.floor(Date.now() / 60000)}`;
	const countStr = await c.env.RATE_LIMITS.get(rlKey);
	const count = countStr ? parseInt(countStr, 10) : 0;
	if (count >= RATE_LIMITS.REQUESTS_PER_MINUTE) return c.json({ error: 'Too Many Requests' }, 429);
	await c.env.RATE_LIMITS.put(rlKey, String(count + 1), { expirationTtl: 120 });

	// Cache (optional): prompt hash within model
	const inputText = body.input ?? body.messages?.map((m) => `${m.role}: ${m.content}`).join('\n') ?? '';
	const cacheKey = `resp:${model}:${await sha256(inputText)}`;
	const cached = await c.env.CACHE.get(cacheKey);
	if (cached) {
		return c.json(JSON.parse(cached));
	}

	// Determine provider from model and content type
	let provider: string;
	if (body.audio) {
		// Audio files always use Groq Whisper
		provider = PROVIDER_ROUTING.AUDIO;
	} else if (MODEL_PATTERNS.GEMINI.some(pattern => matchesModel(model, pattern))) {
		// Explicit Gemini models
		provider = PROVIDERS.GOOGLE;
	} else if (MODEL_PATTERNS.GPT.some(pattern => matchesModel(model, pattern)) || 
	           MODEL_PATTERNS.WHISPER.some(pattern => matchesModel(model, pattern))) {
		// Explicit Groq models
		provider = PROVIDERS.GROQ;
	} else {
		// Default: Gemini for text
		provider = PROVIDERS.GOOGLE;
	}
	
	const payload = {
		provider,
		model,
		input: body.input,
		messages: body.messages,
		stream: Boolean(body.stream),
		audio: body.audio,
		audioFormat: body.audioFormat,
		requestId: genId('req'),
		projectId: project.id,
	};

	// If Queues not available, use waitUntil for async processing
	c.executionCtx.waitUntil((async () => {
		await processTask({ id: payload.requestId, body: payload } as any, c.env as any);
	})());

	return c.json({ requestId: payload.requestId }, 202);
});

async function callGemini(model: string, inputText: string, apiKey: string) {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
	const googleReq = {
		contents: [
			{ role: 'user', parts: [{ text: inputText }] },
		],
		generationConfig: { maxOutputTokens: 1024 },
	};
	const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(googleReq) });
	if (!res.ok) {
		throw new Error(await res.text());
	}
	const data = await res.json<any>();
	
	// Check for safety blocks or empty response
	if (data?.candidates?.[0]?.finishReason === 'SAFETY') {
		console.warn('Gemini blocked response due to safety:', data.candidates[0]);
		throw new Error('Content blocked by safety filter');
	}
	
	if (!data?.candidates || data.candidates.length === 0) {
		console.warn('Gemini returned no candidates:', JSON.stringify(data, null, 2));
		throw new Error('No candidates in Gemini response');
	}
	
	const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ?? '';
	
	if (!text) {
		console.warn('Gemini returned empty text. Full response:', JSON.stringify(data, null, 2));
		throw new Error(`Empty response from Gemini. Finish reason: ${data?.candidates?.[0]?.finishReason || 'unknown'}`);
	}
	
	console.log('Gemini response:', JSON.stringify(data, null, 2));
	return { text };
}

async function callGeminiWithKeyRotation(env: Env, projectId: string, model: string, inputText: string): Promise<{ text: string }> {
	const keyManager = new KeyManagerService(env);
	
	// Try to get a valid key and make the API call
	const { key, keyId } = await keyManager.getNextValidKey(PROVIDERS.GOOGLE, model);
	
	try {
		console.log(`[KeyRotation] Trying key ${keyId} for Gemini API call`);
		const result = await callGemini(model, inputText, key);
		
		// Mark key as valid if API call succeeds
		await keyManager.markKeyAsValid(keyId);
		console.log(`[KeyRotation] Key ${keyId} is valid, API call successful`);
		
		return result;
	} catch (error) {
		console.error(`[KeyRotation] Key ${keyId} failed:`, error);
		
		// Parse error message - it might be JSON
		let errorMessage = String(error).toLowerCase();
		let isAuthError = false;
		
		// Try to parse as JSON first
		try {
			const errorText = String(error);
			const jsonMatch = errorText.match(/\{.*\}/);
			if (jsonMatch) {
				const errorJson = JSON.parse(jsonMatch[0]);
				console.log(`[KeyRotation] Parsed JSON error:`, errorJson);
				
				if (errorJson.error) {
					const errorObj = errorJson.error;
					if (errorObj.message && (
						errorObj.message.toLowerCase().includes('invalid api key') ||
						errorObj.message.toLowerCase().includes('api key not valid') ||
						errorObj.message.toLowerCase().includes('authentication') ||
						errorObj.message.toLowerCase().includes('unauthorized')
					)) {
						isAuthError = true;
					}
					if (errorObj.type && (
						errorObj.type.toLowerCase().includes('invalid_request_error') ||
						errorObj.type.toLowerCase().includes('authentication_error')
					)) {
						isAuthError = true;
					}
					if (errorObj.code && (
						errorObj.code.toLowerCase().includes('invalid_api_key') ||
						errorObj.code.toLowerCase().includes('api_key_invalid')
					)) {
						isAuthError = true;
					}
				}
			}
		} catch (parseError) {
			console.log(`[KeyRotation] Could not parse error as JSON, using string matching`);
		}
		
		// Also check plain text patterns
		if (!isAuthError) {
			if (errorMessage.includes('api key not valid') || 
				errorMessage.includes('api_key_invalid') ||
				errorMessage.includes('invalid_argument') ||
				errorMessage.includes('invalid api key') ||
				errorMessage.includes('authentication') ||
				errorMessage.includes('unauthorized')) {
				isAuthError = true;
			}
		}
		
		console.log(`[KeyRotation] Is auth error: ${isAuthError}`);
		
		if (isAuthError) {
			console.log(`[KeyRotation] Marking key ${keyId} as invalid due to auth error`);
			await keyManager.markKeyAsInvalid(keyId);
			
			// Try with the next key
			return await callGeminiWithKeyRotation(env, projectId, model, inputText);
		}
		
		// If it's not an auth error, re-throw
		throw error;
	}
}

async function callWhisperWithKeyRotation(env: Env, projectId: string, audioBase64: string, audioFormat: string): Promise<{ text: string }> {
	const keyManager = new KeyManagerService(env);
	
	// Try to get a valid key and make the API call
	const { key, keyId } = await keyManager.getNextValidKey(PROVIDERS.GROQ, 'whisper-large-v3');
	
	try {
		console.log(`[KeyRotation] Trying key ${keyId} for Whisper API call`);
		const result = await callWhisper(audioBase64, audioFormat, key);
		
		// Mark key as valid if API call succeeds
		await keyManager.markKeyAsValid(keyId);
		console.log(`[KeyRotation] Key ${keyId} is valid, API call successful`);
		
		return result;
	} catch (error) {
		console.error(`[KeyRotation] Key ${keyId} failed:`, error);
		console.error(`[KeyRotation] Error type:`, typeof error);
		console.error(`[KeyRotation] Error string:`, String(error));
		
		// Parse error message - it might be JSON
		let errorMessage = String(error).toLowerCase();
		let isAuthError = false;
		
		// Try to parse as JSON first
		try {
			const errorText = String(error);
			// Look for JSON pattern in error message
			const jsonMatch = errorText.match(/\{.*\}/);
			if (jsonMatch) {
				const errorJson = JSON.parse(jsonMatch[0]);
				console.log(`[KeyRotation] Parsed JSON error:`, errorJson);
				
				// Check JSON error fields
				if (errorJson.error) {
					const errorObj = errorJson.error;
					if (errorObj.message && (
						errorObj.message.toLowerCase().includes('invalid api key') ||
						errorObj.message.toLowerCase().includes('api key not valid') ||
						errorObj.message.toLowerCase().includes('authentication') ||
						errorObj.message.toLowerCase().includes('unauthorized')
					)) {
						isAuthError = true;
					}
					if (errorObj.type && (
						errorObj.type.toLowerCase().includes('invalid_request_error') ||
						errorObj.type.toLowerCase().includes('authentication_error')
					)) {
						isAuthError = true;
					}
					if (errorObj.code && (
						errorObj.code.toLowerCase().includes('invalid_api_key') ||
						errorObj.code.toLowerCase().includes('api_key_invalid')
					)) {
						isAuthError = true;
					}
				}
			}
		} catch (parseError) {
			console.log(`[KeyRotation] Could not parse error as JSON, using string matching`);
		}
		
		// Also check plain text patterns
		if (!isAuthError) {
			if (errorMessage.includes('api key not valid') || 
				errorMessage.includes('api_key_invalid') ||
				errorMessage.includes('invalid_argument') ||
				errorMessage.includes('invalid api key') ||
				errorMessage.includes('authentication') ||
				errorMessage.includes('unauthorized') ||
				errorMessage.includes('budget exceeded') ||
				errorMessage.includes('insufficient_quota') ||
				errorMessage.includes('quota_exceeded') ||
				errorMessage.includes('billing') ||
				errorMessage.includes('payment')) {
				isAuthError = true;
			}
		}
		
		console.log(`[KeyRotation] Is auth error: ${isAuthError}`);
		
		if (isAuthError) {
			console.log(`[KeyRotation] Marking key ${keyId} as invalid due to auth/budget error`);
			await keyManager.markKeyAsInvalid(keyId);
			
			// Try with the next key
			return await callWhisperWithKeyRotation(env, projectId, audioBase64, audioFormat);
		}
		
		// If it's not an auth/budget error, re-throw
		throw error;
	}
}

async function callGroq(model: string, inputText: string, messages: any[], apiKey: string) {
	const url = 'https://api.groq.com/openai/v1/chat/completions';
	const groqReq = {
		model: model.startsWith('gpt-') ? model : `openai/${model}`,
		messages: messages?.length ? messages : [{ role: 'user', content: inputText }],
		max_tokens: 1024,
		temperature: 0.7,
	};
	const res = await fetch(url, { 
		method: 'POST', 
		headers: { 
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json' 
		}, 
		body: JSON.stringify(groqReq) 
	});
	if (!res.ok) {
		throw new Error(await res.text());
	}
	const data = await res.json<any>();
	const text = data?.choices?.[0]?.message?.content ?? '';
	console.log('Groq response:', JSON.stringify(data, null, 2));
	return { text };
}

async function callWhisper(audioBase64: string, audioFormat: string, apiKey: string) {
	const url = 'https://api.groq.com/openai/v1/audio/transcriptions';
	
	// Convert base64 to binary
	const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
	
	const formData = new FormData();
	const audioBlob = new Blob([audioBuffer], { type: `audio/${audioFormat}` });
	formData.append('file', audioBlob, `audio.${audioFormat}`);
	formData.append('model', 'whisper-large-v3');
	formData.append('response_format', 'json');
	
	const res = await fetch(url, { 
		method: 'POST', 
		headers: { 
			'Authorization': `Bearer ${apiKey}`,
		}, 
		body: formData
	});
	if (!res.ok) {
		throw new Error(await res.text());
	}
	const data = await res.json<any>();
	const text = data?.text ?? '';
	console.log('Whisper response:', JSON.stringify(data, null, 2));
	return { text };
}

async function processTask(message: { id: string; body: any }, env: Env) {
	const { provider, model, input, messages, audio, audioFormat, requestId, projectId } = message.body as any;
	const inputText: string = input ?? (messages?.map((m: any) => `${m.role}: ${m.content}`).join('\n') ?? '');
	const t0 = Date.now();
	let status = 'SUCCESS';
	let text = '';
	let promptTokens = inputText.split(/\s+/).length; // rough estimate placeholder
	let completionTokens = 0;
	try {
		let out: { text: string };
		
		if (provider === PROVIDERS.GOOGLE) {
			// Use key rotation for Google with automatic retry on invalid keys
			out = await callGeminiWithKeyRotation(env, projectId, model, inputText);
		} else if (provider === PROVIDERS.GROQ) {
			// Use key rotation for Groq
			// Check if this is a Whisper request (audio transcription)
			if (audio && MODEL_PATTERNS.WHISPER.some(pattern => matchesModel(model, pattern))) {
				out = await callWhisperWithKeyRotation(env, projectId, audio, audioFormat || 'mp3');
			} else {
				const groqKey = await getNextGroqKey(env, projectId, model);
				out = await callGroq(model, inputText, messages, groqKey);
			}
		} else {
			throw new Error(`Unsupported provider: ${provider}`);
		}
		
		text = out.text;
		completionTokens = text.split(/\s+/).length; // rough estimate placeholder
	} catch (e) {
		status = 'ERROR';
		text = String(e);
		console.error(`${provider} API error for request ${requestId}:`, e);
	}
	const latency = Date.now() - t0;
	// cost: try fetch pricing from KV
	let cost = 0;
	try {
		const cfgStr = await env.PROVIDERS_CONFIG.get(`provider:${provider}`);
		if (cfgStr) {
			const cfg = JSON.parse(cfgStr);
			const p = cfg?.pricing?.[model];
			if (p) {
				const inRate = Number(p.input) / 1_000_000; // per token if per 1M tokens pricing
				const outRate = Number(p.output) / 1_000_000;
				cost = promptTokens * inRate + completionTokens * outRate;
			}
		}
	} catch {}
	if (!cost) {
		// Default pricing estimates
		if (provider === 'google') {
			cost = (promptTokens + completionTokens) * 0.000001;
		} else if (provider === 'groq') {
			cost = (promptTokens + completionTokens) * 0.0000005; // Groq is cheaper
		}
	}

	// Log to database using journal_generations
	const detailsJson = JSON.stringify({
		status,
		provider,
		cost,
		promptTokens,
		completionTokens,
		latencyMs: latency,
		requestBody: { model, input, messages },
		responseBody: { content: text },
		original_log_id: requestId,
		original_projectId: projectId
	});
	
	await env.DB.prepare(
		`INSERT INTO journal_generations 
		(uuid, full_maid, model_name, status, token_in, token_out, total_token, details, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
	).bind(
		crypto.randomUUID(), // uuid
		requestId, // full_maid
		model,
		status,
		promptTokens,
		completionTokens,
		promptTokens + completionTokens,
		detailsJson
	).run();

	if (status === 'SUCCESS') {
		await env.CACHE.put(`resp:${model}:${await sha256(inputText)}`, JSON.stringify({ requestId, model, content: text }), { expirationTtl: CACHE_SETTINGS.TTL_SECONDS });
	}

	await env.DB.prepare(
		`UPDATE deals 
		SET data_in = json_set(data_in, '$.currentUsage', CAST(JSON_EXTRACT(data_in, '$.currentUsage') AS REAL) + ?)
		WHERE daid = ?`
	).bind(cost, projectId).run();

	console.log('Processed message', message.id, 'requestId', requestId, 'status', status, 'latency', latency);
}

const handlers: ExportedHandler<Env> = {
	fetch: app.fetch,
	// @ts-ignore
	scheduled: reporter?.scheduled,
};

export default handlers;


