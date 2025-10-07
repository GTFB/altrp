import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';

describe('Admin Blog [slug] - Integration', () => {
  it('GET returns 404 when not found', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { findBySlug: async () => null } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/foo');
    const res = await GET(req, { params: Promise.resolve({ slug: 'foo' }) });
    expect(res.status).toBe(404);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


