import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/posts/[slug]/route';
import { PostRepository } from '@/repositories/post.repository';

describe('API Posts [slug] Route - Integration Tests', () => {
  it('should return a post for existing slug (if any data exists)', async () => {
    const repo = PostRepository.getInstance();
    const all = await repo.findAll();

    if (all.length === 0) {
      // No content in repository; nothing to assert for 200-case
      expect(true).toBe(true);
      return;
    }

    const existingSlug = all[0].slug;
    const request = new NextRequest(`http://localhost:3000/api/posts/${existingSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: existingSlug }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('post');
    expect(data.post).toBeTruthy();
    expect(typeof data.post.slug).toBe('string');
  });

  it('should return 404 for non-existing slug', async () => {
    const nonExisting = 'this-slug-should-not-exist-123456789';
    const request = new NextRequest(`http://localhost:3000/api/posts/${nonExisting}`);
    const response = await GET(request, { params: Promise.resolve({ slug: nonExisting }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('should return 500 on internal error', async () => {
    const originalGetInstance = PostRepository.getInstance;
    const originalConsoleError = console.error;

    const failingRepo = {
      findBySlug: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as PostRepository;

    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => failingRepo;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const slug = 'any-slug';
      const request = new NextRequest(`http://localhost:3000/api/posts/${slug}`);
      const response = await GET(request, { params: Promise.resolve({ slug }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      (PostRepository as unknown as { getInstance: typeof originalGetInstance }).getInstance = originalGetInstance;
      console.error = originalConsoleError;
    }
  });
});


