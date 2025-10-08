import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthorRepository } from '@/repositories/author.repository';
import { htmlToMarkdown } from '@/lib/html-to-markdown';

const authorSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

interface UpdateAuthorRequest {
  name: string;
  avatar?: string;
  bio?: string;
  content: string;
  newSlug?: string; // If provided, will rename the file
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body: UpdateAuthorRequest = await request.json();
    const { slug } = await params;
    
    // Validate required fields
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const repo = AuthorRepository.getInstance();
    const markdownContent = htmlToMarkdown(body.content);
    const updated = await repo.updateAuthor(slug, {
      name: body.name,
      avatar: body.avatar,
      bio: body.bio,
      content: markdownContent,
      newSlug: body.newSlug,
    });
    if (!updated) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message:
        body.newSlug && body.newSlug !== slug
          ? 'Author updated and renamed successfully'
          : 'Author updated successfully',
      slug: body.newSlug || slug,
      oldSlug: body.newSlug && body.newSlug !== slug ? slug : undefined,
    });

  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { error: 'Failed to update author' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const repo = AuthorRepository.getInstance();
    const author = await repo.findBySlug(slug);
    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, author });

  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const repo = AuthorRepository.getInstance();
    const ok = await repo.deleteAuthor(slug);
    if (!ok) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Author deleted successfully', slug });

  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { error: 'Failed to delete author' },
      { status: 500 }
    );
  }
}
