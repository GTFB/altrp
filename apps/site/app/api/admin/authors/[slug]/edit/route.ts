import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const authorPath = path.join(contentDir, `${slug}.mdx`);

    // Check if author exists
    try {
      await fs.access(authorPath);
    } catch {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Read the author file
    const raw = await fs.readFile(authorPath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      author: {
        slug,
        name: data.name,
        avatar: data.avatar,
        bio: data.bio,
        content: content,
      }
    });

  } catch (error) {
    console.error('Error fetching author for edit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    );
  }
}
