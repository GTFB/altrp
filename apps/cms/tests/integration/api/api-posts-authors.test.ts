import { describe, it, expect } from 'bun:test';
import { GET } from '@/app/api/posts/authors/route';
import { PostRepository } from '@/repositories/post.repository';

describe('API Posts Authors Route - Integration Tests', () => {
  it('should return authors list', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('authors');
    expect(Array.isArray(data.authors)).toBe(true);

    if (data.authors.length > 0) {
      expect(data.authors.every((a: unknown) => typeof a === 'string')).toBe(true);
    }
  });

  it('should handle internal errors and return 500', async () => {
    const original = PostRepository.getInstance;

    const repoMock = {
      findAllAuthors: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as PostRepository;

    // mock PostRepository.getInstance to return a failing mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PostRepository as any).getInstance = () => repoMock;

    const originalError = console.error;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      // restore original method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PostRepository as any).getInstance = original;
      console.error = originalError;
    }
  });
});


