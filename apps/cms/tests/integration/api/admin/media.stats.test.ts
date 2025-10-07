import { describe, it, expect } from 'bun:test';
import { MediaRepository } from '@/repositories/media.repository';

describe('Admin Media Stats - Integration', () => {
  it('GET returns stats', async () => {
    const original = MediaRepository.getInstance;
    const mockRepo = { getMediaStats: async () => ({ total: 1 }) } as unknown as MediaRepository;
    (MediaRepository as unknown as { getInstance: () => MediaRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/media/stats/route');
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('total');

    (MediaRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


