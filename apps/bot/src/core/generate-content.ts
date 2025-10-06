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
 * Recursively reads all MDX files from content folder
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
        path: relativePath.replace(/\\/g, '/'), // Normalize paths for Unix
        content: content.trim()
      });
    }
  }

  return files;
}

/**
 * Generates TypeScript file with translations
 */
function generateContentFile(contentFiles: ContentFile[]): string {
  const translations: Record<string, Record<string, string>> = {};
  
  for (const file of contentFiles) {
    // Extract language and key from path: ru/selectLanguage.mdx -> ru, selectLanguage
    const pathParts = file.path.split('/');
    if (pathParts.length === 2) {
      const [locale, filename] = pathParts;
      const messageKey = filename.replace('.mdx', '');
      
      if (!translations[locale]) {
        translations[locale] = {};
      }
      
      // Escape backticks and backslashes
      const escapedContent = file.content
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
      
      translations[locale][messageKey] = escapedContent;
    }
  }

  return `// Automatically generated file with translations
// Do not edit manually!

export const translations: Record<string, Record<string, string>> = ${JSON.stringify(translations, null, 2)};
`;
}

/**
 * Main function
 */
function main() {
  const contentDir = path.join(__dirname, '..', 'content');
  const outputFile = path.join(__dirname, '..', 'generated-content.ts');

  console.log('Reading MDX files from:', contentDir);
  
  if (!fs.existsSync(contentDir)) {
    console.error('Content folder not found:', contentDir);
    process.exit(1);
  }

  const contentFiles = readMdxFiles(contentDir);
  console.log(`Found ${contentFiles.length} MDX files:`);
  
  for (const file of contentFiles) {
    console.log(`  - ${file.path}`);
  }

  const generatedContent = generateContentFile(contentFiles);
  
  // Create src folder if it does not exist
  const srcDir = path.dirname(outputFile);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, generatedContent, 'utf-8');
  console.log(`Generated file: ${outputFile}`);
}

// Run main function
main();
