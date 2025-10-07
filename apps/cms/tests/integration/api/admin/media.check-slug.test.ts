import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';

describe('Admin Media Check Slug - Integration', () => {
  it('validates slug presence and format', async () => {
    const { POST } = await import('@/app/api/admin/media/check-slug/route');
    const r1 = new NextRequest('http://localhost/api/admin/media/check-slug', { method: 'POST', body: JSON.stringify({}) } as any);
    const res1 = await POST(r1);
    const d1 = await res1.json();
    expect(d1).toHaveProperty('available', false);

    const r2 = new NextRequest('http://localhost/api/admin/media/check-slug', { method: 'POST', body: JSON.stringify({ slug: 'Invalid_Slug' }) } as any);
    const res2 = await POST(r2);
    const d2 = await res2.json();
    expect(d2).toHaveProperty('available', false);
  });
});


