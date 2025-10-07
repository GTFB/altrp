import { describe, it, expect } from 'bun:test';
import { CategoryRepository } from '@/repositories/category.repository';

describe('Admin Categories Root - Integration', () => {
  it('GET returns categories list', async () => {
    const original = CategoryRepository.getInstance;
    const mockRepo = { findAll: async () => ([{ slug: 'c1', title: 'Cat' }]) } as unknown as CategoryRepository;
    (CategoryRepository as unknown as { getInstance: () => CategoryRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/categories/route');
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);

    (CategoryRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


