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