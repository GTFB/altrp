import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';
import type { Post } from '@/types/post';

describe('Admin Blog [slug] - Integration', () => {
  const mockPost: Post = {
    slug: 'test-post',
    title: 'Test Post',
    content: 'Test content',
    date: '2024-01-01',
    tags: ['test'],
    excerpt: 'Test excerpt',
  };

  it('GET returns 404 when not found', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { findBySlug: async () => null } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/foo');
    const res = await GET(req, { params: Promise.resolve({ slug: 'foo' }) });
    expect(res.status).toBe(404);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('GET returns post when found', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { 
      findBySlug: async (slug: string) => slug === 'test-post' ? mockPost : null 
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { GET } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/test-post');
    const res = await GET(req, { params: Promise.resolve({ slug: 'test-post' }) });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.post.slug).toBe('test-post');

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('DELETE returns 404 when post not found', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { 
      findBySlug: async () => null,
      deletePost: async () => false
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { DELETE } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/nonexistent', { method: 'DELETE' } as any);
    const res = await DELETE(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    
    expect(res.status).toBe(404);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('DELETE successfully deletes post', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { 
      findBySlug: async (slug: string) => slug === 'test-post' ? mockPost : null,
      deletePost: async (slug: string) => slug === 'test-post'
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { DELETE } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/test-post', { method: 'DELETE' } as any);
    const res = await DELETE(req, { params: Promise.resolve({ slug: 'test-post' }) });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.slug).toBe('test-post');

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('PUT returns 404 when post not found', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { 
      findBySlug: async () => null,
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { PUT } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/nonexistent', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated', content: 'Updated content' })
    } as any);
    const res = await PUT(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    
    expect(res.status).toBe(404);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('PUT returns 400 when title or content missing', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = {} as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { PUT } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/test-post', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }) // missing content
    } as any);
    const res = await PUT(req, { params: Promise.resolve({ slug: 'test-post' }) });
    
    expect(res.status).toBe(400);

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('PUT successfully updates post', async () => {
    const updatedPost = { ...mockPost, title: 'Updated Title' };
    const original = PostRepository.getInstance;
    const mockRepo = { 
      findBySlug: async (slug: string) => {
        if (slug === 'test-post') return mockPost;
        if (slug === 'new-slug') return null;
        return null;
      },
      updatePost: async (oldSlug: string, updates: Partial<Post>) => updatedPost
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { PUT } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/test-post', {
      method: 'PUT',
      body: JSON.stringify({ 
        title: 'Updated Title', 
        content: 'Updated content'
      })
    } as any);
    const res = await PUT(req, { params: Promise.resolve({ slug: 'test-post' }) });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('updated successfully');

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });

  it('PUT returns 409 when new slug already exists', async () => {
    const original = PostRepository.getInstance;
    const mockRepo = { 
      findBySlug: async (slug: string) => {
        if (slug === 'test-post') return mockPost;
        if (slug === 'existing-slug') return { ...mockPost, slug: 'existing-slug' };
        return null;
      },
    } as unknown as PostRepository;
    (PostRepository as unknown as { getInstance: () => PostRepository }).getInstance = () => mockRepo;

    const { PUT } = await import('@/app/api/admin/blog/[slug]/route');
    const req = new NextRequest('http://localhost/api/admin/blog/test-post', {
      method: 'PUT',
      body: JSON.stringify({ 
        title: 'Updated Title', 
        content: 'Updated content',
        newSlug: 'existing-slug'
      })
    } as any);
    const res = await PUT(req, { params: Promise.resolve({ slug: 'test-post' }) });
    
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('already exists');

    (PostRepository as unknown as { getInstance: typeof original }).getInstance = original;
  });
});
