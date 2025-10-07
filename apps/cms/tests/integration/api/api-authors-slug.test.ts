import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/authors/[slug]/route';
import { AuthorRepository } from '@/repositories/author.repository';

describe('API Authors [slug] Route - Integration Tests', () => {
  it('should return author for existing slug (if any data exists)', async () => {
    const repo = AuthorRepository.getInstance();
    const authors = await repo.findAll();

    if (authors.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const existingSlug = authors[0].slug;
    const request = new NextRequest(`http://localhost:3000/api/authors/${existingSlug}`);
    const response = await GET(request, { params: Promise.resolve({ slug: existingSlug }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('author');
    expect(data.author).toBeTruthy();
  });

  it('should return 404 for non-existing slug', async () => {
    const nonExisting = 'this-author-does-not-exist-123456';
    const request = new NextRequest(`http://localhost:3000/api/authors/${nonExisting}`);
    const response = await GET(request, { params: Promise.resolve({ slug: nonExisting }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('should return 500 on internal error', async () => {
    const originalGetInstance = AuthorRepository.getInstance;
    const originalConsoleError = console.error;

    const failingRepo = {
      findBySlug: async () => {
        throw new Error('Mocked failure');
      },
    } as unknown as AuthorRepository;

    (AuthorRepository as unknown as { getInstance: () => AuthorRepository }).getInstance = () => failingRepo;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => {};

    try {
      const slug = 'any-slug';
      const request = new NextRequest(`http://localhost:3000/api/authors/${slug}`);
      const response = await GET(request, { params: Promise.resolve({ slug }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    } finally {
      (AuthorRepository as unknown as { getInstance: typeof originalGetInstance }).getInstance = originalGetInstance;
      console.error = originalConsoleError;
    }
  });
});


