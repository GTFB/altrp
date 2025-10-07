import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/posts/route';
import { PostRepository } from '@/repositories/post.repository';

describe('API Posts Route - Integration Tests', () => {
  describe('GET /api/posts', () => {
    it('should return posts with default parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('posts');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle limit parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts.length).toBeLessThanOrEqual(5);
      expect(data.total).toBeGreaterThanOrEqual(data.posts.length);
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle tags parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?tags=javascript,react');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle empty tags parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?tags=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle search parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?search=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle category parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?category=tech');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle author parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?author=john-doe');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle sortBy parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?sortBy=title');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle sortOrder parameter correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?sortOrder=asc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle invalid sortBy parameter gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?sortBy=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle invalid sortOrder parameter gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?sortOrder=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle multiple parameters together', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?limit=3&tags=javascript,react&search=test&category=tech&author=john-doe&sortBy=date&sortOrder=desc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.posts.length).toBeLessThanOrEqual(3);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should handle non-numeric limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?limit=abc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle negative limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?limit=-5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle tags with empty values', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?tags=javascript,,react,');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should return consistent total count regardless of limit', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/posts?limit=5');
      const request2 = new NextRequest('http://localhost:3000/api/posts?limit=10');
      
      const response1 = await GET(request1);
      const response2 = await GET(request2);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.total).toBe(data2.total);
    });

    it('should handle URL encoding in parameters', async () => {
      const search = 'test with spaces';
      const encodedSearch = encodeURIComponent(search);
      const request = new NextRequest(`http://localhost:3000/api/posts?search=${encodedSearch}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle special characters in parameters', async () => {
      const tags = 'tag-with-dash,tag_with_underscore';
      const request = new NextRequest(`http://localhost:3000/api/posts?tags=${tags}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle very long query parameters', async () => {
      const longTag = 'a'.repeat(1000);
      const request = new NextRequest(`http://localhost:3000/api/posts?tags=${longTag}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should handle empty results gracefully', async () => {
      // This test might return empty results depending on the data
      const request = new NextRequest('http://localhost:3000/api/posts?search=nonexistentsearchterm123456');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(0);
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should return valid JSON structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Validate required fields exist
      expect(data).toHaveProperty('posts');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      
      // Validate field types
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
      
      // Validate non-negative values
      expect(data.total).toBeGreaterThanOrEqual(0);
    });

    it('should return consistent response structure across different parameters', async () => {
      const testCases = [
        '?limit=5',
        '?tags=javascript',
        '?search=test',
        '?category=tech',
        '?author=john',
        '?sortBy=title&sortOrder=asc'
      ];

      for (const params of testCases) {
        const request = new NextRequest(`http://localhost:3000/api/posts${params}`);
        const response = await GET(request);
        const data = await response.json();
        
        expect(response.status).toBe(200);
        
        expect(data).toHaveProperty('posts');
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('hasMore');
        expect(Array.isArray(data.posts)).toBe(true);
        expect(typeof data.total).toBe('number');
        expect(typeof data.hasMore).toBe('boolean');
      }
    });

    it('should return 500 on internal error', async () => {
      const originalGetInstance = PostRepository.getInstance;
      const originalConsoleError = console.error;

      const failingRepo = {
        findWithFilters: async () => {
          throw new Error('Mocked failure');
        },
      } as unknown as PostRepository;

      (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => failingRepo;
      // silence error logs for this negative case
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      console.error = () => {};

      try {
        const request = new NextRequest('http://localhost:3000/api/posts');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toHaveProperty('error');
      } finally {
        // restore originals
        (PostRepository as unknown as { getInstance: typeof originalGetInstance }).getInstance = originalGetInstance;
        console.error = originalConsoleError;
      }
    });
  });
});
