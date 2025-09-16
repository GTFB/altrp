export interface Repository<T> {
  findAll(): Promise<T[]>;
  findBySlug(slug: string): Promise<T | null>;
}

// Re-export function from shared/lib/content-path.ts for convenience
export { getContentDir } from '@/lib/content-path';