import { NextRequest, NextResponse } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

export async function POST(request: NextRequest) {
  try {
    const { slug, currentSlug } = await request.json();

    if (!slug) {
      return NextResponse.json({
        available: false,
        error: 'Slug is required'
      });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Slug must contain only lowercase letters, numbers, and hyphens'
      });
    }

    const mediaRepo = MediaRepository.getInstance();
    
    // If we're editing and the slug hasn't changed, it's available
    if (currentSlug && slug === currentSlug) {
      return NextResponse.json({ available: true });
    }

    // Check if slug already exists
    const existingMedia = await mediaRepo.findBySlug(slug);
    
    return NextResponse.json({
      available: !existingMedia
    });
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}
