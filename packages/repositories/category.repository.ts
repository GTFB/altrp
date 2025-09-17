import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseMarkdown } from '@/lib/markdown';
import { z } from 'zod';
import { getContentDir } from '@/lib/content-path';

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
  private static instance: CategoryRepository | null = null;
  private contentDir = getContentDir('categories');

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
  }

  public static getInstance(): CategoryRepository {
    if (!CategoryRepository.instance) {
      CategoryRepository.instance = new CategoryRepository();
    }
    return CategoryRepository.instance;
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
      const parsedContent = await parseMarkdown(content);
      
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

  async createCategory(categoryData: Omit<Category, 'slug'> & { slug: string }): Promise<Category | null> {
    try {
      const { slug, ...frontmatterData } = categoryData;
      const filePath = path.join(this.contentDir, `${slug}.mdx`);

      // Check if category already exists
      try {
        await fs.access(filePath);
        throw new Error('Category with this slug already exists');
      } catch (error) {
        if (error instanceof Error && error.message !== 'Category with this slug already exists') {
          // File doesn't exist, which is good
        } else {
          throw error;
        }
      }

      // Prepare frontmatter
      const frontmatter = {
        title: frontmatterData.title,
        date: frontmatterData.date || new Date().toISOString().split('T')[0],
        tags: frontmatterData.tags || [],
        excerpt: frontmatterData.excerpt,
      };

      // Validate frontmatter
      const validatedFrontmatter = categorySchema.parse(frontmatter);

      // Prepare content
      const mdxContent = `---\n${Object.entries(validatedFrontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
          }
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        })
        .join('\n')}\n---\n\n${frontmatterData.content || ''}`;

      // Write the category file
      await fs.writeFile(filePath, mdxContent, 'utf8');

      return this.findBySlug(slug);
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }
}
