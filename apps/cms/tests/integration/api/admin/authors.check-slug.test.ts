import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';

describe('Admin Authors Check Slug - Integration', () => {
  it('validates slug presence and format', async () => {
    const { POST } = await import('@/app/api/admin/authors/check-slug/route');
    const r1 = new NextRequest('http://localhost/api/admin/authors/check-slug', { method: 'POST', body: JSON.stringify({}) } as any);
    const res1 = await POST(r1);
    expect(res1.status).toBe(400);

    const r2 = new NextRequest('http://localhost/api/admin/authors/check-slug', { method: 'POST', body: JSON.stringify({ slug: 'Invalid_Slug' }) } as any);
    const res2 = await POST(r2);
    const d2 = await res2.json();
    expect(d2).toHaveProperty('available', false);
  });
});


