import { describe, it, expect } from 'bun:test';
import { GET } from '@/app/api/authors/route';

describe('API Authors Route - Integration Tests', () => {
  it('should return authors list', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('authors');
    expect(Array.isArray(data.authors)).toBe(true);

    if (data.authors.length > 0) {
      expect(data.authors.every((a: unknown) => typeof a === 'object' || typeof a === 'string')).toBe(true);
    }
  });

  it('should handle internal errors and return 500', async () => {
    const { AuthorRepository } = await import('@/repositories/author.repository');
    const original = AuthorRepository.getInstance;

    const repoMock = {
      findAll: async () => {
        throw new Error('Mocked failure');
      },
    } as any;

    (AuthorRepository as any).getInstance = () => repoMock;
    const originalError = console.error;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      (AuthorRepository as any).getInstance = original;
      console.error = originalError;
    }
  });
});


