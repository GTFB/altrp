export interface Repository<T> {
  findAll(): Promise<T[]>;
  findBySlug(slug: string, locale?: string): Promise<T | null>;
}

export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: string[];
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
}

export interface BaseSearchableRepository<T> extends Repository<T> {
  search(query: string, options?: SearchOptions): Promise<SearchResult<T>[]>;
}

// Re-export function from packages/lib/content-path.ts for convenience
export { getContentDir } from '@/lib/content-path';