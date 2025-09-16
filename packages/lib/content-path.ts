import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Universal function for getting content directory path
 * @param contentType - content type (authors, blog, categories, pages, media)
 * @returns full path to content directory
 */
export function getContentDir(contentType: 'authors' | 'blog' | 'categories' | 'pages' | 'media'): string {
  // Use process.cwd() as fallback, but try to find project root
  let projectRoot = process.cwd();
  
  // Try to find project root by going up directories
  let currentDir = process.cwd();
  while (currentDir !== path.dirname(currentDir)) {
    if (require('fs').existsSync(path.join(currentDir, 'content'))) {
      projectRoot = currentDir;
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return path.join(projectRoot, 'content', contentType);
}
