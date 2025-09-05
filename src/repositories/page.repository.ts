import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { frontmatterSchema, type Frontmatter } from '@/lib/validators/content.schema';

export interface Page {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
  media?: string;
}

export interface PageFilters {
  tags?: string[];
  search?: string;
}

export interface PageSortOptions {
  field: 'date' | 'title' | 'created';
  order: 'asc' | 'desc';
}

export class PageRepository {
  private static instance: PageRepository | null = null;
  private contentDir = path.join(process.cwd(), 'content', 'pages');

  private constructor() {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }

  public static getInstance(): PageRepository {
    if (!PageRepository.instance) {
      PageRepository.instance = new PageRepository();
    }
    return PageRepository.instance;
  }

  async findAll(): Promise<Page[]> {
    return this.findWithFilters();
  }

  async findWithFilters(
    filters: PageFilters = {},
    sortOptions: PageSortOptions = { field: 'title', order: 'asc' }
  ): Promise<Page[]> {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const pages: Page[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const slug = entry.name.replace('.mdx', '');
          const page = await this.findBySlug(slug);
          if (page) {
            pages.push(page);
          }
        }
      }

      // Apply filters
      let filteredPages = this.applyFilters(pages, filters);

      // Apply sorting
      return this.applySorting(filteredPages, sortOptions);
    } catch (error) {
      console.error('Error reading pages:', error);
      return [];
    }
  }

  private applyFilters(pages: Page[], filters: PageFilters): Page[] {
    return pages.filter(page => {
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = page.tags?.some(tag => 
          filters.tags!.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Text search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = page.title.toLowerCase().includes(searchLower);
        const matchesDescription = page.description?.toLowerCase().includes(searchLower) || false;
        const matchesExcerpt = page.excerpt?.toLowerCase().includes(searchLower) || false;
        const matchesTags = page.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ) || false;

        if (!matchesTitle && !matchesDescription && !matchesExcerpt && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(pages: Page[], sortOptions: PageSortOptions): Page[] {
    return pages.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOptions.field) {
        case 'date':
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created':
          // Use date as creation time
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (sortOptions.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  async findBySlug(slug: string): Promise<Page | null> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, 'utf8');
      let { data, content } = matter(raw);

      // Convert date to string if it's a Date object
      const processedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      const validatedData = frontmatterSchema.parse(processedData);
      
      // Parse Markdown content to HTML
      let parsedContent = content;
      try {
        parsedContent = await marked(content);
      } catch (markdownError) {
        console.warn(`Warning: Could not parse markdown for page ${slug}:`, markdownError);
        // Fallback to raw content if markdown parsing fails
      }
      
      return {
        slug,
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        tags: validatedData.tags,
        excerpt: validatedData.excerpt || '',
        content: parsedContent,
        media: validatedData.media,
      };
    } catch (error) {
      console.error(`Error reading page ${slug}:`, error);
      return null;
    }
  }

  async findAllTags(): Promise<string[]> {
    try {
      const pages = await this.findAll();
      const tags = new Set<string>();
      
      pages.forEach(page => {
        if (page.tags) {
          page.tags.forEach(tag => tags.add(tag));
        }
      });
      
      return Array.from(tags).sort();
    } catch (error) {
      console.error('Error reading tags:', error);
      return [];
    }
  }

  async findByTag(tag: string): Promise<Page[]> {
    return this.findWithFilters({ tags: [tag] });
  }

  async searchPages(query: string): Promise<Page[]> {
    return this.findWithFilters({ search: query });
  }

  async createPage(pageData: Omit<Page, 'slug'> & { slug: string }): Promise<Page | null> {
    try {
      const { slug, ...frontmatterData } = pageData;
      const filePath = path.join(this.contentDir, `${slug}.mdx`);

      // Check if page already exists
      try {
        await fs.access(filePath);
        throw new Error('Page with this slug already exists');
      } catch (error) {
        if (error instanceof Error && error.message !== 'Page with this slug already exists') {
          // File doesn't exist, which is good
        } else {
          throw error;
        }
      }

      // Prepare frontmatter
      const frontmatter = {
        title: frontmatterData.title,
        description: frontmatterData.description,
        date: frontmatterData.date || new Date().toISOString().split('T')[0],
        tags: frontmatterData.tags || [],
        excerpt: frontmatterData.excerpt,
        media: frontmatterData.media,
      };

      // Validate frontmatter
      const validatedFrontmatter = frontmatterSchema.parse(frontmatter);

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

      // Write the page file
      await fs.writeFile(filePath, mdxContent, 'utf8');

      return this.findBySlug(slug);
    } catch (error) {
      console.error('Error creating page:', error);
      return null;
    }
  }

  async updatePage(oldSlug: string, updates: Partial<Page>): Promise<Page | null> {
    try {
      const existingPage = await this.findBySlug(oldSlug);
      if (!existingPage) {
        throw new Error('Page not found');
      }

      const updatedPage = { ...existingPage, ...updates };
      const newSlug = updates.slug || oldSlug;
      const oldFilePath = path.join(this.contentDir, `${oldSlug}.mdx`);
      const newFilePath = path.join(this.contentDir, `${newSlug}.mdx`);

      // Prepare frontmatter
      const frontmatter = {
        title: updatedPage.title,
        description: updatedPage.description,
        date: updatedPage.date,
        tags: updatedPage.tags || [],
        excerpt: updatedPage.excerpt,
        media: updatedPage.media,
      };

      // Validate frontmatter
      const validatedFrontmatter = frontmatterSchema.parse(frontmatter);

      // Prepare content
      const mdxContent = `---\n${Object.entries(validatedFrontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
          }
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        })
        .join('\n')}\n---\n\n${updatedPage.content || ''}`;

      // If slug changed, rename the file
      if (newSlug !== oldSlug) {
        // Write the new file with new slug
        await fs.writeFile(newFilePath, mdxContent, 'utf8');
        // Delete the old file
        await fs.unlink(oldFilePath);
      } else {
        // Just update the existing file
        await fs.writeFile(oldFilePath, mdxContent, 'utf8');
      }

      return this.findBySlug(newSlug);
    } catch (error) {
      console.error('Error updating page:', error);
      return null;
    }
  }

  async deletePage(slug: string): Promise<boolean> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting page:', error);
      return false;
    }
  }
}
