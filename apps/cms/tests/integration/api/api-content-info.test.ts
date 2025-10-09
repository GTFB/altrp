import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/content-info/route';
import { PostRepository } from '@/repositories/post.repository';

describe('API Content Info Route - Integration Tests', () => {
  it('should return 400 when slug is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/content-info');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should return 404 for non-existing content', async () => {
    const slug = 'non-existing-slug-123456789';
    const request = new NextRequest(`http://localhost:3000/api/content-info?slug=${slug}&type=post`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('should return content info for existing post (if any data exists)', async () => {
    const repo = PostRepository.getInstance();
    const posts = await repo.findAll();

    if (posts.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const slug = posts[0].slug;
    const request = new NextRequest(`http://localhost:3000/api/content-info?slug=${encodeURIComponent(slug)}&type=post`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('type');
    expect(data).toHaveProperty('slug');
    expect(data.type).toBe('post');
    expect(typeof data.slug).toBe('string');
  });

  it('should return 500 on internal error (post branch)', async () => {
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
      const request = new NextRequest('http://localhost:3000/api/content-info?slug=anything&type=post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      (PostRepository as unknown as { getInstance: typeof originalGetInstance }).getInstance = originalGetInstance;
      console.error = originalConsoleError;
    }
  });
});


