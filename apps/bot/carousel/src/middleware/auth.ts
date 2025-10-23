import { Context, Next } from 'hono';
import { sha256Base64 } from '../utils';

export interface AuthContext {
	projectId: string;
	monthlyBudget: number;
	currentUsage: number;
}

export async function authMiddleware(c: Context, next: Next) {
	const auth = c.req.header('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	
	if (!token) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	
	const tokenHash = await sha256Base64(token);
	const project = await c.env.DB.prepare(
		'SELECT id, monthlyBudget, currentUsage FROM projects WHERE apiKeyHash = ? LIMIT 1'
	).bind(tokenHash).first() as { id: string; monthlyBudget: number; currentUsage: number } | null;
	
	if (!project) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	
	c.set('auth', {
		projectId: project.id,
		monthlyBudget: project.monthlyBudget,
		currentUsage: project.currentUsage
	} as AuthContext);
	
	await next();
}
