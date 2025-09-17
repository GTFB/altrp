import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseMarkdown } from '@/lib/markdown';
import { z } from 'zod';
import { getContentDir } from '@/lib/content-path';

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
  private static instance: AuthorRepository | null = null;
  private contentDir = getContentDir('authors');

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
  }

  public static getInstance(): AuthorRepository {
    if (!AuthorRepository.instance) {
      AuthorRepository.instance = new AuthorRepository();
    }
    return AuthorRepository.instance;
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
      const parsedContent = await parseMarkdown(content);
      
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

  async createAuthor(authorData: Omit<Author, 'slug'> & { slug: string }): Promise<Author | null> {
    try {
      const { slug, ...frontmatterData } = authorData;
      const filePath = path.join(this.contentDir, `${slug}.mdx`);

      // Check if author already exists
      try {
        await fs.access(filePath);
        throw new Error('Author with this slug already exists');
      } catch (error) {
        if (error instanceof Error && error.message !== 'Author with this slug already exists') {
          // File doesn't exist, which is good
        } else {
          throw error;
        }
      }

      // Prepare frontmatter
      const frontmatter = {
        name: frontmatterData.name,
        avatar: frontmatterData.avatar,
        bio: frontmatterData.bio,
      };

      // Validate frontmatter
      const validatedFrontmatter = authorSchema.parse(frontmatter);

      // Prepare content
      const mdxContent = `---\n${Object.entries(validatedFrontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        })
        .join('\n')}\n---\n\n${frontmatterData.content || ''}`;

      // Write the author file
      await fs.writeFile(filePath, mdxContent, 'utf8');

      return this.findBySlug(slug);
    } catch (error) {
      console.error('Error creating author:', error);
      return null;
    }
  }
}
