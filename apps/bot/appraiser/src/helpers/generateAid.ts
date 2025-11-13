/**
 * Generate short ID with prefix for ...aid fields
 * Example: m-abc123
 */
export function generateAid(prefix: string): string {
  const id = randomBase36(6);
  return `${prefix}-${id}`;
}

function randomBase36(len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < len; i++) {
      out += chars[bytes[i] % chars.length];
    }
    return out;
  }
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}