import { describe, it, expect } from 'bun:test';
import { NextRequest } from 'next/server';
import { ComponentRepository } from '@/repositories/component.repository';

describe('Admin Components [path] - Integration', () => {
  it('GET returns 400 for invalid path error mapping', async () => {
    const original = ComponentRepository.getInstance;
    const mockRepo = { getComponentFileContent: async () => { const e = new Error('Invalid path'); throw e; } } as unknown as ComponentRepository;
    (ComponentRepository as unknown as { getInstance: () => ComponentRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/components/[path]/route');
    const req = new NextRequest('http://localhost/api/admin/components/foo');
    const res = await GET(req, { params: Promise.resolve({ path: 'foo' }) });
    expect(res.status).toBe(400);

    (ComponentRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});


