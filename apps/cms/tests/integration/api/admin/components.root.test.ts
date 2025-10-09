import { describe, it, expect } from 'bun:test';

describe('Admin Components Root - Integration', () => {
  it('GET returns components list', async () => {
    const { GET } = await import('@/app/api/admin/components/route');
    const res = await GET({} as any);
    expect([200]).toContain(res.status);
  });
});


