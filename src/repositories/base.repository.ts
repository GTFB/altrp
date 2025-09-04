export interface Repository<T> {
  findAll(): Promise<T[]>;
  findBySlug(slug: string): Promise<T | null>;
}
