import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const authorSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

export interface Author {
  slug: string;
  name: string;
  avatar?: string;
  bio?: string;
  content?: string;
}

export class AuthorRepository {
  private contentDir = path.join(process.cwd(), 'content', 'authors');

  constructor() {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }

  async findAll(): Promise<Author[]> {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const authors: Author[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const slug = entry.name.replace('.mdx', '');
          const author = await this.findBySlug(slug);
          if (author) {
            authors.push(author);
          }
        }
      }

      return authors.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error reading authors:', error);
      return [];
    }
  }

  async findBySlug(slug: string): Promise<Author | null> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(raw);

      const validatedData = authorSchema.parse(data);
      
      // Parse Markdown content to HTML
      let parsedContent = content;
      try {
        parsedContent = await marked(content);
      } catch (markdownError) {
        console.warn(`Warning: Could not parse markdown for author ${slug}:`, markdownError);
        // Fallback to raw content if markdown parsing fails
      }
      
      return {
        slug,
        name: validatedData.name,
        avatar: validatedData.avatar,
        bio: validatedData.bio,
        content: parsedContent,
      };
    } catch (error) {
      console.error(`Error reading author ${slug}:`, error);
      return null;
    }
  }
}
