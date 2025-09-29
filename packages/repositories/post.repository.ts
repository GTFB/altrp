import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Fuse from 'fuse.js';
import { parseMarkdown } from '@/lib/markdown';
import { frontmatterSchema, type Frontmatter } from '@/lib/validators/content.schema';
import { getContentDir } from '@/lib/content-path';
import { BaseSearchableRepository, SearchResult, SearchOptions } from './base.repository';
import { i18nConfig } from '../../apps/cms/src/config/i18n';

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

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PostRepository implements BaseSearchableRepository<Post> {
  private static instance: PostRepository | null = null;
  private contentDir = getContentDir('blog');

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
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
          const post = await this.findBySlug(slug, i18nConfig.defaultLocale);
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

  async findWithPagination(
    filters: PostFilters = {},
    sortOptions: PostSortOptions = { field: 'date', order: 'desc' },
    paginationOptions: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedResult<Post>> {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const posts: Post[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const slug = entry.name;
          const post = await this.findBySlug(slug, i18nConfig.defaultLocale);
          if (post) {
            posts.push(post);
          }
        }
      }

      // Apply filters
      let filteredPosts = this.applyFilters(posts, filters);

      // Apply sorting
      const sortedPosts = this.applySorting(filteredPosts, sortOptions);

      // Calculate pagination
      const total = sortedPosts.length;
      const totalPages = Math.ceil(total / paginationOptions.limit);
      const startIndex = (paginationOptions.page - 1) * paginationOptions.limit;
      const endIndex = startIndex + paginationOptions.limit;
      const paginatedData = sortedPosts.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page: paginationOptions.page,
          limit: paginationOptions.limit,
          total,
          totalPages,
          hasNext: paginationOptions.page < totalPages,
          hasPrev: paginationOptions.page > 1,
        },
      };
    } catch (error) {
      console.error('Error reading posts with pagination:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: paginationOptions.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
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

  async findBySlug(slug: string, locale: string = i18nConfig.defaultLocale): Promise<Post | null> {
    try {
      let fileName = 'index.mdx';
      
      // If locale is not default locale, try to use locale-specific file
      if (locale !== i18nConfig.defaultLocale) {
        fileName = `${locale}.mdx`;
        
        // Check if locale-specific file exists
        const localeFilePath = path.join(this.contentDir, slug, fileName);
        try {
          await fs.access(localeFilePath);
        } catch {
          // If locale-specific file doesn't exist, fallback to default
          fileName = 'index.mdx';
        }
      }
      
      const filePath = path.join(this.contentDir, slug, fileName);
      const raw = await fs.readFile(filePath, 'utf8');
      let { data, content } = matter(raw);

      // Convert date to string if it's a Date object
      const processedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      const validatedData = frontmatterSchema.parse(processedData);
      
      // Parse Markdown content to HTML
      const parsedContent = await parseMarkdown(content);

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

  async findByTag(tag: string): Promise<Post[]> {
    return this.findWithFilters({ tags: [tag] });
  }

  async findAllTags(): Promise<Array<{ tag: string; count: number }>> {
    try {
      const posts = await this.findAll();
      const tagCounts = new Map<string, number>();
      
      posts.forEach(post => {
        if (post.tags) {
          post.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });
      
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error reading tags:', error);
      return [];
    }
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult<Post>[]> {
    try {
      const posts = await this.findAll();
      
      if (!query.trim()) {
        return posts.map(post => ({ item: post, score: 1 }));
      }

      const fuse = new Fuse(posts, {
        includeScore: true,
        includeMatches: true,
        threshold: options.threshold || 0.35,
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'excerpt', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
        ],
      });

      const results = fuse.search(query, { limit: options.limit || 10 });

      return results.map(result => ({
        item: result.item,
        score: result.score,
        matches: result.matches?.map(match => match.value || '') || [],
      }));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  async createPost(postData: Omit<Post, 'slug'> & { slug: string }): Promise<Post | null> {
    try {
      const { slug, ...frontmatterData } = postData;
      const filePath = path.join(this.contentDir, slug, 'index.mdx');

      // Check if post already exists
      try {
        await fs.access(filePath);
        throw new Error('Post with this slug already exists');
      } catch (error) {
        if (error instanceof Error && error.message !== 'Post with this slug already exists') {
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
        category: frontmatterData.category,
        author: frontmatterData.author,
        media: frontmatterData.media,
        seoTitle: frontmatterData.seoTitle,
        seoDescription: frontmatterData.seoDescription,
        seoKeywords: frontmatterData.seoKeywords,
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

      // Create post directory
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Write the post file
      await fs.writeFile(filePath, mdxContent, 'utf8');

      return this.findBySlug(slug);
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }
}
