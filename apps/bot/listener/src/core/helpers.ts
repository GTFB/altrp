/**
 * Checks if text is a VK link
 * @param text - text to check
 * @returns true if text is a VK link
 */
export function isVKLink(text: string): boolean {
  // Check if text is a VK link
  const trimmedText = text.trim();
  
  // Check only explicit VK links
  const vkPatterns = [
    /^https?:\/\/(www\.)?vk\.com\/[a-zA-Z0-9._-]+$/,  // https://vk.com/username
    /^https?:\/\/(www\.)?vkontakte\.ru\/[a-zA-Z0-9._-]+$/   // https://vkontakte.ru/username
  ];
  
  // Check only full VK links
  return vkPatterns.some(pattern => pattern.test(trimmedText));
}

/**
 * Normalizes VK link - adds https://vk.com/ if needed
 * @param vkLink - original link or username
 * @returns normalized VK link
 */
export function normalizeVKLink(vkLink: string): string {
  let normalizedLink = vkLink.trim();
  
  // If starts with @, remove @ and add vk.com
  if (normalizedLink.startsWith('@')) {
    normalizedLink = `https://vk.com/${normalizedLink.substring(1)}`;
  } 
  // If does not start with http, add vk.com
  else if (!normalizedLink.startsWith('http')) {
    normalizedLink = `https://vk.com/${normalizedLink}`;
  }
  
  return normalizedLink;
}

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

/**
 * Generate short ID with prefix for ...aid fields
 * Example: m-abc123
 */
export function generateAid(prefix: string): string {
  const id = randomBase36(6);
  return `${prefix}-${id}`;
}

/**
 * Generate short ID for full_* fields
 * Conventionally same pattern as aid: <prefix>-<6>
 */
export function generateFullId(prefix: string): string {
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