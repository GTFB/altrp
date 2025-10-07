import { describe, it, expect, spyOn } from 'bun:test';
import { NextRequest } from 'next/server';
import * as cookieSession from '@/lib/cookie-session';

describe('API Altrp Session Route - Integration Tests', () => {
  it('GET returns current session data object', async () => {
    const spy = spyOn(cookieSession, 'getSession').mockResolvedValue({ data: { foo: 'bar' } } as any);
    const { GET } = await import('@/app/api/altrp-session/route');

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ foo: 'bar' });

    spy.mockRestore();
  });

  it('POST sets value into session and returns success', async () => {
    const setSpy = spyOn(cookieSession, 'setToSession').mockResolvedValue(undefined as any);
    const { POST } = await import('@/app/api/altrp-session/route');

    const req = new NextRequest('http://localhost:3000/api/altrp-session', {
      method: 'POST',
      body: JSON.stringify({ key: 'theme', value: 'dark' }),
    } as any);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });

    setSpy.mockRestore();
  });

  it('GET returns 500 on session error', async () => {
    const spy = spyOn(cookieSession, 'getSession').mockRejectedValue(new Error('boom'));
    const { GET } = await import('@/app/api/altrp-session/route');

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toHaveProperty('error');

    spy.mockRestore();
  });

  it('POST returns 500 on set error', async () => {
    const setSpy = spyOn(cookieSession, 'setToSession').mockRejectedValue(new Error('boom'));
    const { POST } = await import('@/app/api/altrp-session/route');

    const req = new NextRequest('http://localhost:3000/api/altrp-session', {
      method: 'POST',
      body: JSON.stringify({ key: 'theme', value: 'dark' }),
    } as any);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toHaveProperty('error');

    setSpy.mockRestore();
  });
});


