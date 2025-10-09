import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

describe('Admin Media [slug] - Integration', () => {
  it('GET returns 404 when media not found', async () => {
    const original = MediaRepository.getInstance;
    const mockRepo = { findBySlug: async () => null } as unknown as MediaRepository;
    (MediaRepository as unknown as { getInstance: () => MediaRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/media/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/media/na');
    const res = await GET(req, { params: Promise.resolve({ slug: 'na' }) });
    expect(res.status).toBe(404);

    (MediaRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


