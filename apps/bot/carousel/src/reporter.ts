export interface Env {
	DB: D1Database;
	TELEGRAM_BOT_TOKEN: string;
	TELEGRAM_CHAT_ID: string;
}

async function dailyReport(env: Env) {
	const since = Math.floor(Date.now() / 1000) - 24 * 3600;
	const totals = await env.DB.prepare(
		'SELECT COUNT(*) as cnt, SUM(cost) as cost FROM logs WHERE createdAt >= ?'
	).bind(since).first<{ cnt: number; cost: number }>();
	const topProjects = await env.DB.prepare(
		'SELECT projectId, COUNT(*) as cnt, SUM(cost) as cost FROM logs WHERE createdAt >= ? GROUP BY projectId ORDER BY cost DESC LIMIT 5'
	).bind(since).all<{ projectId: string; cnt: number; cost: number }>();

	const lines: string[] = [];
	lines.push(`*AI Gateway Daily Report*`);
	lines.push(`Requests: ${totals?.cnt ?? 0}`);
	lines.push(`Cost: $${(totals?.cost ?? 0).toFixed(4)}`);
	lines.push('Top projects:');
	for (const r of topProjects.results) {
		lines.push(`- ${r.projectId}: ${r.cnt} req, $${(r.cost ?? 0).toFixed(4)}`);
	}
	const text = lines.join('\n');
	const url = `https://api.telegram.org/bot${encodeURIComponent(env.TELEGRAM_BOT_TOKEN)}/sendMessage`;
	await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
	});
}

const handler: ExportedHandler<Env> = {
	async scheduled(event, env) {
		await dailyReport(env);
	},
};

export default handler;

