import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { frontmatterSchema, type Frontmatter } from '@/lib/validators/content.schema';

export interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
  category?: string;
  author?: string;
  media?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface PostFilters {
  category?: string;
  tags?: string[];
  author?: string;
  search?: string;
}

export interface PostSortOptions {
  field: 'date' | 'title' | 'created';
  order: 'asc' | 'desc';
}

export class PostRepository {
  private static instance: PostRepository | null = null;
  private contentDir = path.join(process.cwd(), 'content', 'blog');

  private constructor() {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }

  public static getInstance(): PostRepository {
    if (!PostRepository.instance) {
      PostRepository.instance = new PostRepository();
    }
    return PostRepository.instance;
  }

  async findAll(): Promise<Post[]> {
    return this.findWithFilters();
  }

  async findWithFilters(
    filters: PostFilters = {},
    sortOptions: PostSortOptions = { field: 'date', order: 'desc' }
  ): Promise<Post[]> {
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

      // Apply filters
      let filteredPosts = this.applyFilters(posts, filters);

      // Apply sorting
      return this.applySorting(filteredPosts, sortOptions);
    } catch (error) {
      console.error('Error reading posts:', error);
      return [];
    }
  }

  private applyFilters(posts: Post[], filters: PostFilters): Post[] {
    return posts.filter(post => {
      // Filter by category
      if (filters.category && post.category !== filters.category) {
        return false;
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = post.tags?.some(tag => 
          filters.tags!.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Filter by author
      if (filters.author && post.author !== filters.author) {
        return false;
      }

      // Text search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(searchLower);
        const matchesDescription = post.description?.toLowerCase().includes(searchLower) || false;
        const matchesExcerpt = post.excerpt?.toLowerCase().includes(searchLower) || false;
        const matchesTags = post.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ) || false;

        if (!matchesTitle && !matchesDescription && !matchesExcerpt && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(posts: Post[], sortOptions: PostSortOptions): Post[] {
    return posts.sort((a, b) => {
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

  async findBySlug(slug: string): Promise<Post | null> {
    try {
      const filePath = path.join(this.contentDir, slug, 'index.mdx');
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
        console.warn(`Warning: Could not parse markdown for post ${slug}:`, markdownError);
        // Fallback to raw content if markdown parsing fails
      }
      console.log(parsedContent);
      return {
        slug,
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        tags: validatedData.tags,
        excerpt: validatedData.excerpt || '',
        content: parsedContent,
        category: data.category,
        author: data.author,
      };
    } catch (error) {
      console.error(`Error reading post ${slug}:`, error);
      return null;
    }
  }

  async findAllCategories(): Promise<string[]> {
    try {
      const posts = await this.findAll();
      const categories = new Set<string>();
      
      posts.forEach(post => {
        if (post.category) {
          categories.add(post.category);
        }
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error reading categories:', error);
      return [];
    }
  }

  async findAllAuthors(): Promise<string[]> {
    try {
      const posts = await this.findAll();
      const authors = new Set<string>();
      
      posts.forEach(post => {
        if (post.author) {
          authors.add(post.author);
        }
      });
      
      return Array.from(authors).sort();
    } catch (error) {
      console.error('Error reading authors:', error);
      return [];
    }
  }

  async findByCategory(category: string): Promise<Post[]> {
    return this.findWithFilters({ category });
  }

  async findByAuthor(author: string): Promise<Post[]> {
    return this.findWithFilters({ author });
  }
}
