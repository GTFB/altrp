import { Context, Next } from 'hono';
import { RATE_LIMITS } from '../../settings';

export async function rateLimitMiddleware(c: Context, next: Next) {
	const auth = c.get('auth');
	if (!auth) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	
	const rlKey = `rl:${auth.projectId}:${Math.floor(Date.now() / 60000)}`;
	const countStr = await c.env.RATE_LIMITS.get(rlKey);
	const count = countStr ? parseInt(countStr, 10) : 0;
	
	if (count >= RATE_LIMITS.REQUESTS_PER_MINUTE) {
		return c.json({ error: 'Too Many Requests' }, 429);
	}
	
	await c.env.RATE_LIMITS.put(rlKey, String(count + 1), { expirationTtl: 120 });
	await next();
}
