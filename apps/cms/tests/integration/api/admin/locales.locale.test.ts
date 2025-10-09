import { describe, it, expect } from 'bun:test';
import { LocalesRepository } from '@/repositories/locales.repository';

describe('Admin Locales [locale] - Integration', () => {
  it('GET reads locale data', async () => {
    const original = LocalesRepository.getInstance;
    const mockRepo = { readLocale: async () => ({ hello: 'world' }) } as unknown as LocalesRepository;
    (LocalesRepository as unknown as { getInstance: () => LocalesRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/locales/[locale]/route');
    const res = await GET({} as any, { params: Promise.resolve({ locale: 'en' }) });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);

    (LocalesRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


