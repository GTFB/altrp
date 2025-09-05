import { NextRequest, NextResponse } from 'next/server';
import { PageRepository } from '@/repositories/page.repository';
import { htmlToMarkdown, markdownToHtml } from '@/lib/html-to-markdown';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const pageRepository = new PageRepository();
    const page = await pageRepository.findBySlug(slug);

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Convert Markdown content to HTML for TipTapEditor
    const htmlContent = markdownToHtml(page.content || '');

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        content: htmlContent,
      }
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { slug: oldSlug } = params;
    
    // Validate required fields
    if (!body.title && !body.slug) {
      return NextResponse.json(
        { error: 'At least one field (title or slug) is required' },
        { status: 400 }
      );
    }

    const pageRepository = new PageRepository();
    
    // If slug is being updated, validate new slug format
    if (body.slug && body.slug !== oldSlug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(body.slug)) {
        return NextResponse.json(
          { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
          { status: 400 }
        );
      }

      // Check if new slug already exists
      const existingPage = await pageRepository.findBySlug(body.slug);
      if (existingPage) {
        return NextResponse.json(
          { error: 'Page with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.slug) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.content) {
      // Convert HTML content to Markdown
      updateData.content = htmlToMarkdown(body.content);
    }

    // Update the page
    const updatedPage = await pageRepository.updatePage(oldSlug, updateData);

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Page not found or could not be updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully',
      page: updatedPage,
      slug: updatedPage?.slug || oldSlug
    });

  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update page' },
      { status: 500 }
    );
  }
}