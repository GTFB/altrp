import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const categorySchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
});

export interface Category {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
}

export class CategoryRepository {
  private contentDir = path.join(process.cwd(), 'content', 'categories');

  constructor() {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }

  async findAll(): Promise<Category[]> {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const categories: Category[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const slug = entry.name.replace('.mdx', '');
          const category = await this.findBySlug(slug);
          if (category) {
            categories.push(category);
          }
        }
      }

      return categories.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('Error reading categories:', error);
      return [];
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(raw);

      // Convert date to string if it's a Date object
      const processedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      const validatedData = categorySchema.parse(processedData);
      
      // Parse Markdown content to HTML
      let parsedContent = content;
      try {
        parsedContent = await marked(content);
      } catch (markdownError) {
        console.warn(`Warning: Could not parse markdown for category ${slug}:`, markdownError);
        // Fallback to raw content if markdown parsing fails
      }
      
      return {
        slug,
        title: validatedData.title,
        date: validatedData.date,
        tags: validatedData.tags,
        excerpt: validatedData.excerpt,
        content: parsedContent,
      };
    } catch (error) {
      console.error(`Error reading category ${slug}:`, error);
      return null;
    }
  }
}
