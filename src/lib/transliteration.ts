// Cyrillic to Latin transliteration mapping
const transliterationMap: Record<string, string> = {
  // Russian Cyrillic
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  
  // Ukrainian Cyrillic
  'і': 'i', 'ї': 'yi', 'є': 'ye', 'ґ': 'g',
  
  // Belarusian Cyrillic
  'ў': 'u',
  
  
  // Serbian Cyrillic
  'ђ': 'dj', 'ј': 'j', 'љ': 'lj', 'њ': 'nj', 'ћ': 'c', 'џ': 'dz',
  
  // Macedonian Cyrillic
  'ѕ': 'dz', 'ќ': 'kj',
  
  // Uppercase variants
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'І': 'I', 'Ї': 'Yi', 'Є': 'Ye', 'Ґ': 'G', 'Ў': 'U',
  'Ђ': 'Dj', 'Ј': 'J', 'Љ': 'Lj', 'Њ': 'Nj', 'Ћ': 'C', 'Џ': 'Dz',
  'Ѕ': 'Dz', 'Ќ': 'Kj'
};

/**
 * Transliterates Cyrillic text to Latin characters
 * @param text - Text to transliterate
 * @returns Transliterated text
 */
export function transliterate(text: string): string {
  return text
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('');
}

/**
 * Converts text to a URL-friendly slug with transliteration
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function textToSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .trim();
}
