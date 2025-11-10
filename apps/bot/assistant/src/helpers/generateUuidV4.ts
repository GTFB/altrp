/**
 * Generate RFC4122 UUID v4
 */
export function generateUuidV4(): string {
  // Prefer crypto if available (Cloudflare Workers, modern runtimes)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant (RFC4122)
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xxxxxx

    const hex: string[] = [];
    for (let i = 0; i < 256; i++) {
      hex.push((i + 0x100).toString(16).substring(1));
    }

    const b = bytes;
    return (
      hex[b[0]] + hex[b[1]] + hex[b[2]] + hex[b[3]] + '-' +
      hex[b[4]] + hex[b[5]] + '-' +
      hex[b[6]] + hex[b[7]] + '-' +
      hex[b[8]] + hex[b[9]] + '-' +
      hex[b[10]] + hex[b[11]] + hex[b[12]] + hex[b[13]] + hex[b[14]] + hex[b[15]]
    );
  }

  // Fallback (non-crypto) – less secure but correct format
  const fallback = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return fallback;
}