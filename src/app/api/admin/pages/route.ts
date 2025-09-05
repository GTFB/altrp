import { NextRequest, NextResponse } from 'next/server';
import { PageRepository } from '@/repositories/page.repository';
import { htmlToMarkdown } from '@/lib/html-to-markdown';

interface CreatePageRequest {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  slug: string;
  media?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePageRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
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

    const pageRepository = PageRepository.getInstance();
    
    // Convert HTML content to Markdown
    const markdownContent = htmlToMarkdown(body.content);

    const pageData = {
      slug: body.slug,
      title: body.title,
      description: body.description,
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      excerpt: body.excerpt,
      content: markdownContent,
      media: body.media,
    };

    const createdPage = await pageRepository.createPage(pageData);

    if (!createdPage) {
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create page' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const pageRepository = PageRepository.getInstance();
    const success = await pageRepository.deletePage(slug);

    if (!success) {
      return NextResponse.json(
        { error: 'Page not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pageRepository = PageRepository.getInstance();
    const pages = await pageRepository.findAll();

    // Return only basic info for the list view
    const pagesList = pages.map(page => ({
      slug: page.slug,
      title: page.title,
      description: page.description,
      date: page.date,
      tags: page.tags || [],
      excerpt: page.excerpt,
      media: page.media,
    }));

    return NextResponse.json({
      success: true,
      pages: pagesList
    });

  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
