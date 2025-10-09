import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { PageRepository } from '@/repositories/page.repository';

describe('Admin Pages [slug] - Integration', () => {
  it('GET returns 404 when page not found', async () => {
    const original = PageRepository.getInstance;
    const mockRepo = { findBySlug: async () => null } as unknown as PageRepository;
    (PageRepository as unknown as { getInstance: () => PageRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/pages/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/pages/na');
    const res = await GET(req, { params: Promise.resolve({ slug: 'na' }) });
    expect(res.status).toBe(404);

    (PageRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


