import { describe, it, expect } from 'bun:test';
import { GET } from '@/app/api/categories/route';
import { CategoryRepository } from '@/repositories/category.repository';

describe('API Categories Route - Integration Tests', () => {
  it('should return categories list', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('categories');
    expect(Array.isArray(data.categories)).toBe(true);
    if (data.categories.length > 0) {
      expect(data.categories.every((c: unknown) => typeof c === 'object' || typeof c === 'string')).toBe(true);
    }
  });

  it('should handle internal errors and return 500', async () => {
    const original = CategoryRepository.getInstance;
    const repoMock = {
      findAll: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as CategoryRepository;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (CategoryRepository as any).getInstance = () => repoMock;
    const originalError = console.error;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (CategoryRepository as any).getInstance = original;
      console.error = originalError;
    }
  });
});


