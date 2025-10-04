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
    const contentDir = path.join(process.cwd(), 'content', 'categories');
    const categoryPath = path.join(contentDir, `${slug}.mdx`);

    // Check if category exists
    try {
      await fs.access(categoryPath);
    } catch {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Read the category file
    const raw = await fs.readFile(categoryPath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      category: {
        slug,
        title: data.title,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        content: content,
      }
    });

  } catch (error) {
    console.error('Error fetching category for edit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
