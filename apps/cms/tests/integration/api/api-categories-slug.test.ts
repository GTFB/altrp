import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/categories/[slug]/route';
import { CategoryRepository } from '@/repositories/category.repository';

describe('API Categories [slug] Route - Integration Tests', () => {
  it('should return category for existing slug (if any data exists)', async () => {
    const repo = CategoryRepository.getInstance();
    const categories = await repo.findAll();

    if (categories.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const existingSlug = categories[0].slug;
    const request = new NextRequest(`http://localhost:3000/api/categories/${existingSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: existingSlug }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('category');
    expect(data.category).toBeTruthy();
  });

  it('should return 404 for non-existing slug', async () => {
    const nonExisting = 'this-category-does-not-exist-123456';
    const request = new NextRequest(`http://localhost:3000/api/categories/${nonExisting}`);
    const response = await GET(request, { params: Promise.resolve({ slug: nonExisting }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('should return 500 on internal error', async () => {
    const originalGetInstance = CategoryRepository.getInstance;
    const originalConsoleError = console.error;

    const failingRepo = {
      findBySlug: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as CategoryRepository;

    (CategoryRepository as unknown as { getInstance: () => CategoryRepository }).getInstance = () => failingRepo;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const slug = 'any-slug';
      const request = new NextRequest(`http://localhost:3000/api/categories/${slug}`);
      const response = await GET(request, { params: Promise.resolve({ slug }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      (CategoryRepository as unknown as { getInstance: typeof originalGetInstance }).getInstance = originalGetInstance;
      console.error = originalConsoleError;
    }
  });
});


