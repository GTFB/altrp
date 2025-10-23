import { Context, Next } from 'hono';
import { SECURITY } from '../../settings';

export async function corsMiddleware(c: Context, next: Next) {
	const origin = c.req.header('Origin');
	const method = c.req.method;
	
	// Check if origin is allowed
	if (SECURITY.CORS.ALLOWED_ORIGINS.includes('*') || 
		(origin && (SECURITY.CORS.ALLOWED_ORIGINS as readonly string[]).includes(origin))) {
		c.header('Access-Control-Allow-Origin', (origin || '*') as string);
	}
	
	// Set CORS headers
	c.header('Access-Control-Allow-Methods', SECURITY.CORS.ALLOWED_METHODS.join(', '));
	c.header('Access-Control-Allow-Headers', SECURITY.CORS.ALLOWED_HEADERS.join(', '));
	c.header('Access-Control-Max-Age', SECURITY.CORS.MAX_AGE.toString());
	
	// Handle preflight requests
	if (method === 'OPTIONS') {
		return new Response('', { status: 204 });
	}
	
	await next();
}

export async function ipWhitelistMiddleware(c: Context, next: Next) {
	if (!SECURITY.IP_WHITELIST.ENABLED) {
		await next();
		return;
	}
	
	const clientIP = c.req.header('CF-Connecting-IP') || 
	                c.req.header('X-Forwarded-For') || 
	                c.req.header('X-Real-IP') || 
	                'unknown';
	
	// Check if IP is blocked
	if ((SECURITY.IP_WHITELIST.BLOCKED_IPS as readonly string[]).includes(clientIP)) {
		return c.json({ error: 'Access denied' }, 403);
	}
	
	// Check if IP is whitelisted (if whitelist is not empty)
	if (SECURITY.IP_WHITELIST.ALLOWED_IPS.length > 0 && 
		!(SECURITY.IP_WHITELIST.ALLOWED_IPS as readonly string[]).includes(clientIP)) {
		return c.json({ error: 'Access denied' }, 403);
	}
	
	await next();
}

export async function securityHeadersMiddleware(c: Context, next: Next) {
	// Security headers
	c.header('X-Content-Type-Options', 'nosniff');
	c.header('X-Frame-Options', 'DENY');
	c.header('X-XSS-Protection', '1; mode=block');
	c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
	c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	
	// CSP header
	c.header('Content-Security-Policy', 
		"default-src 'self'; " +
		"script-src 'self' 'unsafe-inline'; " +
		"style-src 'self' 'unsafe-inline'; " +
		"img-src 'self' data: https:; " +
		"connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com"
	);
	
	await next();
}
