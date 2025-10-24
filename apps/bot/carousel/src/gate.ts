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
	PRICING, 
	RATE_LIMITS, 
	CACHE_SETTINGS 
} from '../settings';

// Key rotation functions
async function getNextGoogleKey(env: Env, projectId: string): Promise<string> {
	// Get current key index from KV
	const keyIndexKey = `key_rotation:${projectId}:google`;
	const currentIndex = await env.RATE_LIMITS.get(keyIndexKey) || '0';
	const index = parseInt(currentIndex, 10);
	
	// Available Google keys from settings
	const googleKeys = API_KEYS.GOOGLE.map(keyName => (env as any)[keyName]).filter(Boolean);
	
	const selectedKey = googleKeys[index % googleKeys.length];
	
	// Rotate to next key
	await env.RATE_LIMITS.put(keyIndexKey, String((index + 1) % googleKeys.length), { expirationTtl: 86400 });
	
	return selectedKey;
}

async function getNextGroqKey(env: Env, projectId: string): Promise<string> {
	// Get current key index from KV
	const keyIndexKey = `key_rotation:${projectId}:groq`;
	const currentIndex = await env.RATE_LIMITS.get(keyIndexKey) || '0';
	const index = parseInt(currentIndex, 10);
	
	// Available Groq keys from settings
	const groqKeys = API_KEYS.GROQ.map(keyName => (env as any)[keyName]).filter(Boolean);
	
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
		'SELECT id FROM projects WHERE apiKeyHash = ? LIMIT 1'
	).bind(tokenHash).first<{ id: string }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Get result from database
	const result = await c.env.DB.prepare(
		'SELECT status, provider, model, cost, promptTokens, completionTokens, latencyMs, requestBody, responseBody, createdAt FROM logs WHERE id = ? AND projectId = ? LIMIT 1'
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
		'SELECT id FROM projects WHERE apiKeyHash = ? LIMIT 1'
	).bind(tokenHash).first<{ id: string }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Check if request exists in database
	const result = await c.env.DB.prepare(
		'SELECT status, createdAt FROM logs WHERE id = ? AND projectId = ? LIMIT 1'
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
		'SELECT id FROM projects WHERE apiKeyHash = ? LIMIT 1'
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
		'SELECT id, monthlyBudget, currentUsage FROM projects WHERE apiKeyHash = ? LIMIT 1'
	).bind(tokenHash).first<{ id: string; monthlyBudget: number; currentUsage: number }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	// Get model from query parameter
	const model = c.req.query('model') || DEFAULT_MODELS.AUDIO;
	
	// Check permissions
	const perm = await c.env.DB.prepare(
		'SELECT 1 FROM project_permissions WHERE projectId = ? AND ? LIKE REPLACE(modelPattern, "*", "%") LIMIT 1'
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

		// Process synchronously for immediate response
		const requestId = genId('req');
		const t0 = Date.now();
		let status = 'SUCCESS';
		let text = '';
		let cost = 0;
		
		try {
			// Call Whisper with key rotation
			const groqKey = await getNextGroqKey(c.env, project.id);
			const out = await callWhisper(base64, fileExt, groqKey);
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
		await c.env.DB.prepare(
			'INSERT INTO logs (id, projectId, status, provider, model, cost, promptTokens, completionTokens, latencyMs, requestBody, responseBody, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' 
		).bind(
			requestId,
			project.id,
			status,
			'groq',
			model,
			cost,
			0, // promptTokens for audio
			text.split(/\s+/).length, // completionTokens
			latency,
			JSON.stringify({ model, audioFormat: fileExt }),
			JSON.stringify({ content: text }),
			Math.floor(Date.now() / 1000)
		).run();

		// Update project usage
		await c.env.DB.prepare('UPDATE projects SET currentUsage = currentUsage + ? WHERE id = ?').bind(cost, project.id).run();

		console.log('Processed audio file', requestId, 'status', status, 'latency', latency);

		// Return result immediately
		if (status === 'SUCCESS') {
			return c.json({ 
				content: text,
				requestId: requestId,
				cached: false
			});
		} else {
			return c.json({ 
				error: text,
				requestId: requestId
			}, 500);
		}

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
		'SELECT id, monthlyBudget, currentUsage FROM projects WHERE apiKeyHash = ? LIMIT 1'
	).bind(tokenHash).first<{ id: string; monthlyBudget: number; currentUsage: number }>();
	if (!project) return c.json({ error: 'Unauthorized' }, 401);

	const model = body.model || DEFAULT_MODELS.TEXT;

	// Permissions
	const perm = await c.env.DB.prepare(
		'SELECT 1 FROM project_permissions WHERE projectId = ? AND ? LIKE REPLACE(modelPattern, "*", "%") LIMIT 1'
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
	const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ?? '';
	console.log('Gemini response:', JSON.stringify(data, null, 2));
	return { text };
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
			// Use key rotation for Google
			const apiKey = await getNextGoogleKey(env, projectId);
			out = await callGemini(model, inputText, apiKey);
		} else if (provider === PROVIDERS.GROQ) {
			// Use key rotation for Groq
			const groqKey = await getNextGroqKey(env, projectId);
			// Check if this is a Whisper request (audio transcription)
			if (audio && MODEL_PATTERNS.WHISPER.some(pattern => matchesModel(model, pattern))) {
				out = await callWhisper(audio, audioFormat || 'mp3', groqKey);
			} else {
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

	await env.DB.prepare(
		'INSERT INTO logs (id, projectId, status, provider, model, cost, promptTokens, completionTokens, latencyMs, requestBody, responseBody, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' 
	).bind(
		requestId,
		projectId,
		status,
		provider,
		model,
		cost,
		promptTokens,
		completionTokens,
		latency,
		JSON.stringify({ model, input, messages }),
		JSON.stringify({ content: text }),
		Math.floor(Date.now() / 1000)
	).run();

	if (status === 'SUCCESS') {
		await env.CACHE.put(`resp:${model}:${await sha256(inputText)}`, JSON.stringify({ requestId, model, content: text }), { expirationTtl: CACHE_SETTINGS.TTL_SECONDS });
	}

	await env.DB.prepare('UPDATE projects SET currentUsage = currentUsage + ? WHERE id = ?').bind(cost, projectId).run();

	console.log('Processed message', message.id, 'requestId', requestId, 'status', status, 'latency', latency);
}

const handlers: ExportedHandler<Env> = {
	fetch: app.fetch,
	// @ts-ignore
	scheduled: reporter?.scheduled,
};

export default handlers;


