import { describe, it, expect } from 'bun:test';

describe('API Auth Status - Integration Tests', () => {
  it('returns config with flags', async () => {
    const prev = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    };

    process.env.NEXTAUTH_SECRET = 'testsecret';
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { GET } = await import('@/app/api/auth/status/route');

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('config');
    expect(typeof data.config.hasSecret).toBe('boolean');
    expect(typeof data.config.hasGitHub).toBe('boolean');
    expect(typeof data.config.hasGoogle).toBe('boolean');
    expect(typeof data.config.providersCount).toBe('number');

    Object.assign(process.env, prev);
  });
});


