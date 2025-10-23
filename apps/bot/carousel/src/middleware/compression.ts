import { Context, Next } from 'hono';
import { PERFORMANCE } from '../../settings';

export async function compressionMiddleware(c: Context, next: Next) {
	if (!PERFORMANCE.COMPRESSION.ENABLED) {
		await next();
		return;
	}
	
	await next();
	
	// Only compress if response is large enough
	const response = c.res;
	const contentLength = response.headers.get('content-length');
	
	if (contentLength && parseInt(contentLength) < PERFORMANCE.COMPRESSION.MIN_SIZE) {
		return;
	}
	
	// Check if client supports compression
	const acceptEncoding = c.req.header('accept-encoding') || '';
	const supportsGzip = acceptEncoding.includes('gzip');
	const supportsBrotli = acceptEncoding.includes('br');
	const supportsDeflate = acceptEncoding.includes('deflate');
	
	if (!supportsGzip && !supportsBrotli && !supportsDeflate) {
		return;
	}
	
	// Get response body
	const body = await response.text();
	
	// Choose compression algorithm
	let compressed: Uint8Array;
	let encoding: string;
	
	if (supportsBrotli && PERFORMANCE.COMPRESSION.ALGORITHMS.includes('brotli')) {
		// Note: Brotli compression would need a library like @types/brotli
		// For now, fall back to gzip
		compressed = await compressGzip(body);
		encoding = 'gzip';
	} else if (supportsGzip && PERFORMANCE.COMPRESSION.ALGORITHMS.includes('gzip')) {
		compressed = await compressGzip(body);
		encoding = 'gzip';
	} else if (supportsDeflate && PERFORMANCE.COMPRESSION.ALGORITHMS.includes('deflate')) {
		compressed = await compressDeflate(body);
		encoding = 'deflate';
	} else {
		return;
	}
	
	// Update response headers
	c.header('content-encoding', encoding);
	c.header('content-length', compressed.length.toString());
	
	// Return compressed response
	return c.body(compressed as any);
}

async function compressGzip(data: string): Promise<Uint8Array> {
	const stream = new CompressionStream('gzip');
	const writer = stream.writable.getWriter();
	const reader = stream.readable.getReader();
	
	// Write data
	await writer.write(new TextEncoder().encode(data));
	await writer.close();
	
	// Read compressed data
	const chunks: Uint8Array[] = [];
	let done = false;
	
	while (!done) {
		const { value, done: readerDone } = await reader.read();
		done = readerDone;
		if (value) {
			chunks.push(value);
		}
	}
	
	// Combine chunks
	const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	
	return result;
}

async function compressDeflate(data: string): Promise<Uint8Array> {
	const stream = new CompressionStream('deflate');
	const writer = stream.writable.getWriter();
	const reader = stream.readable.getReader();
	
	// Write data
	await writer.write(new TextEncoder().encode(data));
	await writer.close();
	
	// Read compressed data
	const chunks: Uint8Array[] = [];
	let done = false;
	
	while (!done) {
		const { value, done: readerDone } = await reader.read();
		done = readerDone;
		if (value) {
			chunks.push(value);
		}
	}
	
	// Combine chunks
	const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	
	return result;
}
