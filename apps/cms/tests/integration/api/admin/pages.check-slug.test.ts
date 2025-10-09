import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';

describe('Admin Pages Check Slug - Integration', () => {
  it('validates slug and returns availability', async () => {
    const { GET } = await import('@/app/api/admin/pages/check-slug/route');
    const r1 = new NextRequest('http://localhost/api/admin/pages/check-slug');
    const res1 = await GET(r1);
    expect(res1.status).toBe(400);

    const r2 = new NextRequest('http://localhost/api/admin/pages/check-slug?slug=Invalid_Slug');
    const res2 = await GET(r2);
    const d2 = await res2.json();
    expect(d2).toHaveProperty('available');
  });
});


