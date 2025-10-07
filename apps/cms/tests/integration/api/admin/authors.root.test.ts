import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { AuthorRepository } from '@/repositories/author.repository';

describe('Admin Authors Root - Integration', () => {
  it('POST validates fields and creates author', async () => {
    const { POST } = await import('@/app/api/admin/authors/route');

    const r1 = new NextRequest('http://localhost/api/admin/authors', { method: 'POST', body: JSON.stringify({}) } as any);
    const res1 = await POST(r1);
    expect(res1.status).toBe(400);

    const original = AuthorRepository.getInstance;
    const mockRepo = { createAuthor: async () => ({ slug: 'john' }) } as unknown as AuthorRepository;
    (AuthorRepository as unknown as { getInstance: () => AuthorRepository }).getInstance = () => mockRepo;

    const body = { name: 'John', content: '<p>x</p>', slug: 'john' };
    const r2 = new NextRequest('http://localhost/api/admin/authors', { method: 'POST', body: JSON.stringify(body) } as any);
    const res2 = await POST(r2);
    const d2 = await res2.json();
    expect(res2.status).toBe(200);
    expect(d2).toHaveProperty('success', true);

    (AuthorRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('GET returns authors list', async () => {
    const original = AuthorRepository.getInstance;
    const mockRepo = { findAll: async () => ([{ slug: 'john', name: 'John' }]) } as unknown as AuthorRepository;
    (AuthorRepository as unknown as { getInstance: () => AuthorRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/authors/route');
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(Array.isArray(data.authors)).toBe(true);

    (AuthorRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


