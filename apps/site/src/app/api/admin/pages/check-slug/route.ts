import { NextRequest, NextResponse } from 'next/server';
import { PageRepository } from '@/repositories/page.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const currentSlug = searchParams.get('currentSlug'); // For edit mode
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
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

    const pageRepository = PageRepository.getInstance();
    
    // If we're editing and the slug hasn't changed, it's available
    if (currentSlug && slug === currentSlug) {
      return NextResponse.json({ available: true });
    }

    // Check if slug exists
    const existingPage = await pageRepository.findBySlug(slug);
    
    return NextResponse.json({
      available: !existingPage,
      error: existingPage ? 'Page with this slug already exists' : undefined
    });

  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}