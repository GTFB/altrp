import { NextRequest, NextResponse } from 'next/server';
import { AuthorRepository } from '@/repositories/author.repository';
import { htmlToMarkdown } from '@/lib/html-to-markdown';

interface CreateAuthorRequest {
  name: string;
  avatar?: string;
  bio?: string;
  content: string;
  slug: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAuthorRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.content || !body.slug) {
      return NextResponse.json(
        { error: 'Name, content, and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(body.slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const authorRepository = AuthorRepository.getInstance();
    
    // Convert HTML content to Markdown
    const markdownContent = htmlToMarkdown(body.content);

    const authorData = {
      slug: body.slug,
      name: body.name,
      avatar: body.avatar,
      bio: body.bio,
      content: markdownContent,
    };

    const createdAuthor = await authorRepository.createAuthor(authorData);

    if (!createdAuthor) {
      return NextResponse.json(
        { error: 'Failed to create author' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Author created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create author' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authorRepository = AuthorRepository.getInstance();
    const authors = await authorRepository.findAll();

    // Return only basic info for the list view
    const authorsList = authors.map(author => ({
      slug: author.slug,
      name: author.name,
      avatar: author.avatar,
      bio: author.bio,
    }));

    return NextResponse.json({
      success: true,
      authors: authorsList
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}
