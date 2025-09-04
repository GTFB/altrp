import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { frontmatterSchema, type Frontmatter } from '@/lib/validators/content.schema';

export interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
}

export class PostRepository {
  private contentDir = path.join(process.cwd(), 'content', 'blog');

  async findAll(): Promise<Post[]> {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const posts: Post[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const slug = entry.name;
          const post = await this.findBySlug(slug);
          if (post) {
            posts.push(post);
          }
        }
      }

      return posts.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    } catch (error) {
      console.error('Error reading posts:', error);
      return [];
    }
  }

  async findBySlug(slug: string): Promise<Post | null> {
    try {
      const filePath = path.join(this.contentDir, slug, 'index.mdx');
      const raw = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(raw);
      
      // Convert date to string if it's a Date object
      const processedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      const validatedData = frontmatterSchema.parse(processedData);
      
      return {
        slug,
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        tags: validatedData.tags,
        excerpt: content.slice(0, 200) + '...',
        content,
      };
    } catch (error) {
      console.error(`Error reading post ${slug}:`, error);
      return null;
    }
  }
}
