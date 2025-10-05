/**
 * Проверяет, является ли текст ссылкой VK
 * @param text - текст для проверки
 * @returns true если текст является ссылкой VK
 */
export function isVKLink(text: string): boolean {
  // Проверяем, является ли текст ссылкой VK
  const trimmedText = text.trim();
  
  // Проверяем только явные ссылки VK
  const vkPatterns = [
    /^https?:\/\/(www\.)?vk\.com\/[a-zA-Z0-9._-]+$/,  // https://vk.com/username
    /^https?:\/\/(www\.)?vkontakte\.ru\/[a-zA-Z0-9._-]+$/   // https://vkontakte.ru/username
  ];
  
  // Проверяем только полные ссылки VK
  return vkPatterns.some(pattern => pattern.test(trimmedText));
}

/**
 * Нормализует VK ссылку - добавляет https://vk.com/ если нужно
 * @param vkLink - исходная ссылка или username
 * @returns нормализованная ссылка VK
 */
export function normalizeVKLink(vkLink: string): string {
  let normalizedLink = vkLink.trim();
  
  // Если начинается с @, убираем @ и добавляем vk.com
  if (normalizedLink.startsWith('@')) {
    normalizedLink = `https://vk.com/${normalizedLink.substring(1)}`;
  } 
  // Если не начинается с http, добавляем vk.com
  else if (!normalizedLink.startsWith('http')) {
    normalizedLink = `https://vk.com/${normalizedLink}`;
  }
  
  return normalizedLink;
}