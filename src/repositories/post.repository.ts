import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Repository } from './base.repository';
import { frontmatterSchema } from '@/lib/validators/content.schema';

export type Post = {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export class PostRepository implements Repository<Post> {
  async findAll(): Promise<Post[]> {
    const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const posts: Post[] = [];
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const filePath = path.join(CONTENT_DIR, slug, 'index.mdx');
      
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(raw);
        
        // Validate frontmatter with Zod
        const validatedData = frontmatterSchema.parse(data);
        
        posts.push({
          slug,
          title: validatedData.title,
          date: validatedData.date,
          tags: validatedData.tags ?? [],
          excerpt: validatedData.description ?? '',
          content,
        });
      } catch (error) {
        console.warn(`Failed to parse post ${slug}:`, error);
      }
    }
    
    return posts.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const filePath = path.join(CONTENT_DIR, slug, 'index.mdx');
    
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(raw);
      
      // Validate frontmatter with Zod
      const validatedData = frontmatterSchema.parse(data);
      
      return {
        slug,
        title: validatedData.title,
        date: validatedData.date,
        tags: validatedData.tags ?? [],
        excerpt: validatedData.description ?? '',
        content,
      };
    } catch {
      return null;
    }
  }
}
