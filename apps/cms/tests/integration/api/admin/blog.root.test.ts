import { describe, it, expect, spyOn } from 'bun:test';
import { NextRequest } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';

describe('Admin Blog Root Route - Integration', () => {
  it('POST validates required fields and invalid slug', async () => {
    const { POST } = await import('@/app/api/admin/blog/route');

    // missing fields
    const r1 = new NextRequest('http://localhost/api/admin/blog', { method: 'POST', body: JSON.stringify({}) } as any);
    const res1 = await POST(r1);
    expect(res1.status).toBe(400);

    // invalid slug
    const body = { title: 't', content: '<p>x</p>', slug: 'Invalid_Slug' };
    const r2 = new NextRequest('http://localhost/api/admin/blog', { method: 'POST', body: JSON.stringify(body) } as any);
    const res2 = await POST(r2);
    expect(res2.status).toBe(400);
  });

  it('POST creates post successfully', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { createPost: async () => ({ slug: 'ok' }) } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { POST } = await import('@/app/api/admin/blog/route');
    const body = { title: 't', content: '<p>x</p>', slug: 'ok' };
    const req = new NextRequest('http://localhost/api/admin/blog', { method: 'POST', body: JSON.stringify(body) } as any);
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('GET returns list with pagination', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = {
      findWithPagination: async () => ({ data: [{ slug: 's', title: 't' }], pagination: { page: 1, limit: 10, total: 1, hasMore: false } })
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/blog/route');
    const req = new NextRequest('http://localhost/api/admin/blog?page=1&limit=10');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(Array.isArray(data.posts)).toBe(true);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


