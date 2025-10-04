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
    const contentDir = path.join(process.cwd(), 'content', 'pages');
    const pagePath = path.join(contentDir, `${slug}.mdx`);

    // Check if page exists
    try {
      await fs.access(pagePath);
    } catch {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Read the page file
    const raw = await fs.readFile(pagePath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      page: {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        content: content,
      }
    });

  } catch (error) {
    console.error('Error fetching page for edit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}
