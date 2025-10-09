import { describe, it, expect } from 'bun:test';
import { GET } from '@/app/api/posts/categories/route';
import { PostRepository } from '@/repositories/post.repository';

describe('API Posts Categories Route - Integration Tests', () => {
  it('should return categories list', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('categories');
    expect(Array.isArray(data.categories)).toBe(true);

    if (data.categories.length > 0) {
      expect(data.categories.every((c: unknown) => typeof c === 'string')).toBe(true);
    }
  });

  it('should handle internal errors and return 500', async () => {
    const original = PostRepository.getInstance;

    const repoMock = {
      findAllCategories: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as PostRepository;

    // mock PostRepository.getInstance to return a failing mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PostRepository as any).getInstance = () => repoMock;
    const originalError = console.error;
    console.error = () => { };

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      // restore original method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error = originalError;
      (PostRepository as any).getInstance = original;
    }
  });
});


