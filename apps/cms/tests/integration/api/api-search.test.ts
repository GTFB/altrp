import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/route';
import { PostRepository } from '@/repositories/post.repository';

describe('API Search Route - Integration Tests', () => {
  it('should return empty results when query is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/search');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.total).toBe(0);
  });

  it('should return empty results when query is blank', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=   ');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.total).toBe(0);
  });

  it('should respect limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=test&limit=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeLessThanOrEqual(1);
    expect(typeof data.total).toBe('number');
  });

  it('should filter by type=post when provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=test&type=post');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.results)).toBe(true);
    if (data.results.length > 0) {
      expect(data.results.every((r: any) => r.type === 'post')).toBe(true);
    }
  });

  it('should handle URL-encoded queries', async () => {
    const q = encodeURIComponent('test with spaces');
    const request = new NextRequest(`http://localhost:3000/api/search?q=${q}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.results)).toBe(true);
  });

  it('should return 500 on internal error (posts branch)', async () => {
    const originalGetInstance = PostRepository.getInstance;
    const originalConsoleError = console.error;

    const failingRepo = {
      // search is used in posts branch
      search: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as PostRepository;

    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => failingRepo;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const request = new NextRequest('http://localhost:3000/api/search?q=test&type=post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(Array.isArray(data.results)).toBe(true);
      expect(typeof data.total).toBe('number');
    } finally {
      (PostRepository as unknown as { getInstance: typeof originalGetInstance }).getInstance = originalGetInstance;
      console.error = originalConsoleError;
    }
  });
});


