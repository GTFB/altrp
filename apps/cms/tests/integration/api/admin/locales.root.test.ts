import { describe, it, expect } from 'bun:test';
import { LocalesRepository } from '@/repositories/locales.repository';

describe('Admin Locales Root - Integration', () => {
  it('GET lists locales', async () => {
    const original = LocalesRepository.getInstance;
    const mockRepo = { listLocales: async () => (['en.json']) } as unknown as LocalesRepository;
    (LocalesRepository as unknown as { getInstance: () => LocalesRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/locales/route');
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);

    (LocalesRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


