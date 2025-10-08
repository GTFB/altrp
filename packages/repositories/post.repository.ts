import { getContentDir } from "@/lib/content-path";
import {
  BaseSearchableRepository,
  SearchResult,
  SearchOptions,
} from "./base.repository";
import { PROJECT_SETTINGS, SUPPORTED_LANGUAGES } from "@/settings";
import type { PostDataProvider } from "@/types/providers";
import { createPostProvider } from "@/repositories/providers/factory";
import type {
  Post,
  PostFilters,
  PostSortOptions,
  PaginationOptions,
  PaginatedResult,
} from "@/types/post";

// types are imported from '@/types/post'

export class PostRepository implements BaseSearchableRepository<Post> {
  private static instance: PostRepository | null = null;
  private contentDir = getContentDir("blog");
  private readonly provider: PostDataProvider;

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
    this.provider = createPostProvider();
  }

  public static getInstance(): PostRepository {
    if (!PostRepository.instance) {
      PostRepository.instance = new PostRepository();
    }
    return PostRepository.instance;
  }

  async findAll(): Promise<Post[]> {
    return this.provider.findAll();
  }

  async findWithFilters(
    filters: PostFilters = {},
    sortOptions: PostSortOptions = { field: "date", order: "desc" },
  ): Promise<Post[]> {
    return this.provider.findWithFilters(filters, sortOptions);
  }

  async findWithPagination(
    filters: PostFilters = {},
    sortOptions: PostSortOptions = { field: "date", order: "desc" },
    paginationOptions: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<Post>> {
    return this.provider.findWithPagination(
      filters,
      sortOptions,
      paginationOptions,
    );
  }

  private applyFilters(posts: Post[], _filters: PostFilters): Post[] {
    return posts;
  }

  private applySorting(posts: Post[], _sortOptions: PostSortOptions): Post[] {
    return posts;
  }

  async findBySlug(
    slug: string,
    locale: string = PROJECT_SETTINGS.defaultLanguage,
  ): Promise<Post | null> {
    return this.provider.findBySlug(slug, locale);
  }

  async findAllCategories(): Promise<string[]> {
    return this.provider.findAllCategories();
  }

  async findAllAuthors(): Promise<string[]> {
    return this.provider.findAllAuthors();
  }

  async findByCategory(category: string): Promise<Post[]> {
    return this.provider.findByCategory(category);
  }

  async findByAuthor(author: string): Promise<Post[]> {
    return this.provider.findByAuthor(author);
  }

  async findByTag(tag: string): Promise<Post[]> {
    return this.provider.findByTag(tag);
  }

  async findAllTags(): Promise<Array<{ tag: string; count: number }>> {
    return this.provider.findAllTags();
  }

  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult<Post>[]> {
    return this.provider.search(query, options);
  }

  async createPost(
    postData: Omit<Post, "slug"> & { slug: string },
  ): Promise<Post | null> {
    return this.provider.createPost(postData);
  }

  async updatePost(
    oldSlug: string,
    updates: Partial<Post>,
  ): Promise<Post | null> {
    return this.provider.updatePost(oldSlug, updates);
  }

  async deletePost(slug: string): Promise<boolean> {
    return this.provider.deletePost(slug);
  }
}
