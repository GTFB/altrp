import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const postPath = path.join(contentDir, slug, 'index.mdx');

    // Check if post exists
    try {
      await fs.access(postPath);
    } catch {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Read the post file
    const raw = await fs.readFile(postPath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      post: {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        content: content,
        category: data.category,
        author: data.author,
      }
    });

  } catch (error) {
    console.error('Error fetching post for edit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
