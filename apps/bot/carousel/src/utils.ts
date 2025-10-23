export function sha256(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	return crypto.subtle.digest('SHA-256', data).then((buf) =>
		Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
	);
}

export function sha256Base64(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	return crypto.subtle.digest('SHA-256', data).then((buf) =>
		btoa(String.fromCharCode(...new Uint8Array(buf)))
	);
}

export function nowMs(): number {
	return Date.now();
}

export function toUnixTs(): number {
	return Math.floor(Date.now() / 1000);
}

export function genId(prefix = 'req'): string {
	const rnd = Math.random().toString(36).slice(2, 10);
	return `${prefix}_${rnd}`;
}

export function matchesModel(pattern: string, model: string): boolean {
	if (pattern.includes('*')) {
		const re = new RegExp('^' + pattern.split('*').map(escapeRegExp).join('.*') + '$');
		return re.test(model);
	}
	return pattern === model;
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

