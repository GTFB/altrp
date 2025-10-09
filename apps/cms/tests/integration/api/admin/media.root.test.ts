import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

describe('Admin Media Root - Integration', () => {
  it('GET paginates and transforms media', async () => {
    const original = MediaRepository.getInstance;
    const mockRepo = {
      findWithFilters: async () => ([{ slug: 'a.jpg', url: '/images/a.jpg', title: 'A', description: '', alt: 'a', date: '2020-01-01' }])
    } as unknown as MediaRepository;
    (MediaRepository as unknown as { getInstance: () => MediaRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/media/route');
    const req = new NextRequest('http://localhost/api/admin/media?page=1&limit=10');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.media)).toBe(true);

    (MediaRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


