import { describe, it, expect } from 'bun:test';

describe('API Auth [...nextauth] - Module smoke', () => {
  it('exports GET and POST handlers as functions', async () => {
    const prev = { NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET };
    process.env.NEXTAUTH_SECRET = 'testsecret';

    const mod = await import('@/app/api/auth/[...nextauth]/route');
    expect(typeof mod.GET).toBe('function');
    expect(typeof mod.POST).toBe('function');

    process.env.NEXTAUTH_SECRET = prev.NEXTAUTH_SECRET;
  });
});


