import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, currentSlug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Slug must contain only lowercase letters, numbers, and hyphens'
      });
    }

    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const authorPath = path.join(contentDir, `${slug}.mdx`);

    // If checking the same slug as current, it's available
    if (currentSlug && slug === currentSlug) {
      return NextResponse.json({
        available: true,
        message: 'Slug is the same as current'
      });
    }

    // Check if author exists
    try {
      await fs.access(authorPath);
      return NextResponse.json({
        available: false,
        error: 'Author with this slug already exists'
      });
    } catch {
      // Path doesn't exist, slug is available
      return NextResponse.json({
        available: true,
        message: 'Slug is available'
      });
    }

  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug' },
      { status: 500 }
    );
  }
}
