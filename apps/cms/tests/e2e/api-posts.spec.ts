import { test, expect } from '@playwright/test';

test.describe('API Posts Route Tests', () => {
  const baseUrl = 'http://localhost:3000';

  test.describe('GET /api/posts', () => {
    test('should return posts with default parameters', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/posts`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // Check response structure
      expect(data).toHaveProperty('posts');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(Array.isArray(data.posts)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    test('should handle limit parameter correctly', async ({ request }) => {
      const limit = 5;
      const response = await request.get(`${baseUrl}/api/posts?limit=${limit}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.posts.length).toBeLessThanOrEqual(limit);
    });

    test('should handle large limit parameter', async ({ request }) => {
      const limit = 100;
      const response = await request.get(`${baseUrl}/api/posts?limit=${limit}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.posts.length).toBeLessThanOrEqual(limit);
    });

    test('should handle tags parameter', async ({ request }) => {
      const tags = 'javascript,react';
      const response = await request.get(`${baseUrl}/api/posts?tags=${tags}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle empty tags parameter', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/posts?tags=`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle search parameter', async ({ request }) => {
      const search = 'test';
      const response = await request.get(`${baseUrl}/api/posts?search=${search}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle category parameter', async ({ request }) => {
      const category = 'tech';
      const response = await request.get(`${baseUrl}/api/posts?category=${category}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle author parameter', async ({ request }) => {
      const author = 'john-doe';
      const response = await request.get(`${baseUrl}/api/posts?author=${author}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle sortBy parameter', async ({ request }) => {
      const sortBy = 'title';
      const response = await request.get(`${baseUrl}/api/posts?sortBy=${sortBy}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle sortOrder parameter', async ({ request }) => {
      const sortOrder = 'asc';
      const response = await request.get(`${baseUrl}/api/posts?sortOrder=${sortOrder}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle invalid sortBy parameter gracefully', async ({ request }) => {
      const sortBy = 'invalid';
      const response = await request.get(`${baseUrl}/api/posts?sortBy=${sortBy}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle invalid sortOrder parameter gracefully', async ({ request }) => {
      const sortOrder = 'invalid';
      const response = await request.get(`${baseUrl}/api/posts?sortOrder=${sortOrder}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle multiple parameters together', async ({ request }) => {
      const params = new URLSearchParams({
        limit: '3',
        tags: 'javascript,react',
        search: 'test',
        category: 'tech',
        author: 'john-doe',
        sortBy: 'date',
        sortOrder: 'desc'
      });
      
      const response = await request.get(`${baseUrl}/api/posts?${params}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.posts.length).toBeLessThanOrEqual(3);
      expect(typeof data.total).toBe('number');
      expect(typeof data.hasMore).toBe('boolean');
    });

    test('should handle negative limit parameter', async ({ request }) => {
      const limit = -5;
      const response = await request.get(`${baseUrl}/api/posts?limit=${limit}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle non-numeric limit parameter', async ({ request }) => {
      const limit = 'not-a-number';
      const response = await request.get(`${baseUrl}/api/posts?limit=${limit}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle hasMore correctly when posts exceed limit', async ({ request }) => {
      // First get total count
      const totalResponse = await request.get(`${baseUrl}/api/posts`);
      const totalData = await totalResponse.json();
      const totalPosts = totalData.total;
      
      if (totalPosts > 1) {
        const limit = 1;
        const response = await request.get(`${baseUrl}/api/posts?limit=${limit}`);
        
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        expect(data.posts.length).toBeLessThanOrEqual(limit);
        expect(data.hasMore).toBe(totalPosts > limit);
        expect(data.total).toBe(totalPosts);
      }
    });

    test('should return consistent total count regardless of limit', async ({ request }) => {
      const response1 = await request.get(`${baseUrl}/api/posts?limit=5`);
      const response2 = await request.get(`${baseUrl}/api/posts?limit=10`);
      
      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.total).toBe(data2.total);
    });

    test('should handle URL encoding in parameters', async ({ request }) => {
      const search = 'test with spaces';
      const encodedSearch = encodeURIComponent(search);
      const response = await request.get(`${baseUrl}/api/posts?search=${encodedSearch}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle special characters in parameters', async ({ request }) => {
      const tags = 'tag-with-dash,tag_with_underscore';
      const response = await request.get(`${baseUrl}/api/posts?tags=${tags}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed URLs gracefully', async ({ request }) => {
      // Test with invalid characters in URL
      const response = await request.get(`${baseUrl}/api/posts?limit=abc&tags=,,,`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });

    test('should handle very long query parameters', async ({ request }) => {
      const longTag = 'a'.repeat(1000);
      const response = await request.get(`${baseUrl}/api/posts?tags=${longTag}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });
  });

  test.describe('Response Format Validation', () => {
    test('should return valid JSON structure', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/posts`);
      
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      
      const data = await response.json();
      
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
      expect(typeof data.hasMore).toBe('boolean');
    });

    test('should return consistent response structure across different parameters', async ({ request }) => {
      const testCases = [
        '?limit=5',
        '?tags=javascript',
        '?search=test',
        '?category=tech',
        '?author=john',
        '?sortBy=title&sortOrder=asc'
      ];

      for (const params of testCases) {
        const response = await request.get(`${baseUrl}/api/posts${params}`);
        
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        
        expect(data).toHaveProperty('posts');
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('hasMore');
        expect(Array.isArray(data.posts)).toBe(true);
        expect(typeof data.total).toBe('number');
        expect(typeof data.hasMore).toBe('boolean');
      }
    });
  });
});

