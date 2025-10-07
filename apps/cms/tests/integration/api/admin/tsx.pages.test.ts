import { describe, it, expect } from 'bun:test';

describe('Admin TSX Pages - Integration', () => {
  it('POST validates body fields', async () => {
    const { POST } = await import('@/app/api/admin/tsx/pages/route');
    const res1 = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) }));
    expect(res1.status).toBe(400);
  });
});


