import { describe, it, expect } from 'bun:test';

describe('Admin Locales Add Key - Integration', () => {
  it('POST validates key presence', async () => {
    const { POST } = await import('@/app/api/admin/locales/add-key/route');
    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) }));
    expect(res.status).toBe(400);
  });
});


