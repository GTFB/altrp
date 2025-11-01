import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ContentFile {
  path: string;
  content: string;
}

/**
 * Рекурсивно читает все MDX файлы из папки content
 */
function readMdxFiles(dir: string, baseDir: string = dir): ContentFile[] {
  const files: ContentFile[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...readMdxFiles(fullPath, baseDir));
    } else if (item.endsWith('.mdx')) {
      const relativePath = path.relative(baseDir, fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      files.push({
        path: relativePath.replace(/\\/g, '/'), // Нормализуем пути для Unix
        content: content.trim()
      });
    }
  }

  return files;
}

/**
 * Генерирует TypeScript файл с переводами
 */
function generateContentFile(contentFiles: ContentFile[]): string {
  const translations: Record<string, Record<string, string>> = {};
  
  for (const file of contentFiles) {
    // Извлекаем язык и ключ из пути: ru/selectLanguage.mdx -> ru, selectLanguage
    const pathParts = file.path.split('/');
    if (pathParts.length === 2) {
      const [locale, filename] = pathParts;
      if (locale && filename) {
        const messageKey = filename.replace('.mdx', '');
        
        if (!translations[locale]) {
          translations[locale] = {};
        }
        
        // Экранируем обратные кавычки и обратные слеши
        const escapedContent = file.content
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$/g, '\\$');
        
        translations[locale][messageKey] = escapedContent;
      }
    }
  }

  return `// Автоматически сгенерированный файл с переводами
// Не редактировать вручную!

export const translations: Record<string, Record<string, string>> = ${JSON.stringify(translations, null, 2)};
`;
}

/**
 * Основная функция
 */
function main() {
  const contentDir = path.join(__dirname, '..', '..', '..', '..', 'packages', 'content', 'mdxs', 'bot');
  const outputFile = path.join(__dirname, '..', 'generated-content.ts');

  console.log('Читаем MDX файлы из:', contentDir);
  
  if (!fs.existsSync(contentDir)) {
    console.error('Папка content не найдена:', contentDir);
    process.exit(1);
  }

  const contentFiles = readMdxFiles(contentDir);
  console.log(`Найдено ${contentFiles.length} MDX файлов:`);
  
  for (const file of contentFiles) {
    console.log(`  - ${file.path}`);
  }

  const generatedContent = generateContentFile(contentFiles);
  
  // Создаем папку src если её нет
  const srcDir = path.dirname(outputFile);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, generatedContent, 'utf-8');
  console.log(`Сгенерирован файл: ${outputFile}`);
}

// Запускаем main функцию
main();
