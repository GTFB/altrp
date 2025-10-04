import type {
  SearchOptions,
  SearchResult,
} from "@/repositories/base.repository";
import type {
  Post,
  PostFilters,
  PostSortOptions,
  PaginationOptions,
  PaginatedResult,
} from "@/types/post";
import type { Page, PageFilters, PageSortOptions } from "@/types/page";
import type { Category } from "@/types/category";
import type { Author } from "@/types/author";
import type { Media, MediaFilters, MediaSortOptions } from "@/types/media";

export interface AuthorDataProvider {
  findAll(): Promise<Author[]>;
  findBySlug(slug: string): Promise<Author | null>;
  createAuthor(
    authorData: Omit<Author, "slug"> & { slug: string },
  ): Promise<Author | null>;
}

export interface CategoryDataProvider {
  findAll(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
  createCategory(
    categoryData: Omit<Category, "slug"> & { slug: string },
  ): Promise<Category | null>;
}

export interface PageDataProvider {
  findAll(): Promise<Page[]>;
  findWithFilters(
    filters?: PageFilters,
    sortOptions?: PageSortOptions,
  ): Promise<Page[]>;
  findBySlug(slug: string): Promise<Page | null>;
  findAllTags(): Promise<string[]>;
  findByTag(tag: string): Promise<Page[]>;
  searchPages(query: string): Promise<Page[]>;
  createPage(
    pageData: Omit<Page, "slug"> & { slug: string },
  ): Promise<Page | null>;
  updatePage(oldSlug: string, updates: Partial<Page>): Promise<Page | null>;
  deletePage(slug: string): Promise<boolean>;
}

export interface MediaDataProvider {
  findAll(): Promise<Media[]>;
  findWithFilters(
    filters?: MediaFilters,
    sortOptions?: MediaSortOptions,
  ): Promise<Media[]>;
  findBySlug(slug: string): Promise<Media | null>;
  findAllTypes(): Promise<string[]>;
  findAllTags(): Promise<string[]>;
  findByType(type: NonNullable<Media["type"]>): Promise<Media[]>;
  findByTag(tag: string): Promise<Media[]>;
  searchMedia(query: string): Promise<Media[]>;
  createMedia(
    mediaData: Omit<Media, "slug"> & { slug: string },
  ): Promise<Media | null>;
  updateMedia(oldSlug: string, updates: Partial<Media>): Promise<Media | null>;
  deleteMedia(slug: string): Promise<boolean>;
  getMediaStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalSize: number;
    averageSize: number;
  }>;
}

export interface PostDataProvider {
  findAll(): Promise<Post[]>;
  findWithFilters(
    filters?: PostFilters,
    sortOptions?: PostSortOptions,
  ): Promise<Post[]>;
  findWithPagination(
    filters?: PostFilters,
    sortOptions?: PostSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginatedResult<Post>>;
  findBySlug(slug: string, locale?: string): Promise<Post | null>;
  findAllCategories(): Promise<string[]>;
  findAllAuthors(): Promise<string[]>;
  findByCategory(category: string): Promise<Post[]>;
  findByAuthor(author: string): Promise<Post[]>;
  findByTag(tag: string): Promise<Post[]>;
  findAllTags(): Promise<Array<{ tag: string; count: number }>>;
  search(query: string, options?: SearchOptions): Promise<SearchResult<Post>[]>;
  createPost(
    postData: Omit<Post, "slug"> & { slug: string },
  ): Promise<Post | null>;
}
