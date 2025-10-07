import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { PageRepository } from '@/repositories/page.repository';

describe('Admin Pages Root - Integration', () => {
  it('POST validates fields and slug format', async () => {
    const { POST } = await import('@/app/api/admin/pages/route');
    const r1 = new NextRequest('http://localhost/api/admin/pages', { method: 'POST', body: JSON.stringify({}) } as any);
    const res1 = await POST(r1);
    expect(res1.status).toBe(400);

    const r2 = new NextRequest('http://localhost/api/admin/pages', { method: 'POST', body: JSON.stringify({ title: 't', content: '<p>x</p>', slug: 'Invalid_Slug' }) } as any);
    const res2 = await POST(r2);
    expect(res2.status).toBe(400);
  });

  it('GET returns pages list', async () => {
    const original = PageRepository.getInstance;
    const mockRepo = { findAll: async () => ([{ slug: 'p', title: 'T' }]) } as unknown as PageRepository;
    (PageRepository as unknown as { getInstance: () => PageRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/pages/route');
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('success', true);

    (PageRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


