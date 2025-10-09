import { NextRequest, NextResponse } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const mediaRepo = MediaRepository.getInstance();
    const media = await mediaRepo.findBySlug(slug);

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Transform media to match frontend interface
    const transformedMedia = {
      id: media.slug,
      slug: media.slug,
      url: media.url,
      alt: media.alt,
      title: media.title,
      description: media.description,
      filename: media.slug,
      type: media.type,
      size: media.size || 0,
      mimeType: `image/${media.slug.split('.').pop()}`,
      createdAt: media.date || new Date().toISOString()
    };

    return NextResponse.json(transformedMedia);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const mediaRepo = MediaRepository.getInstance();
    
    const updatedMedia = await mediaRepo.updateMedia(slug, body);
    
    if (!updatedMedia) {
      return NextResponse.json(
        { error: 'Failed to update media' },
        { status: 400 }
      );
    }

    // Transform media to match frontend interface
    const transformedMedia = {
      id: updatedMedia.slug,
      url: updatedMedia.url,
      alt: updatedMedia.alt,
      title: updatedMedia.title,
      description: updatedMedia.description,
      filename: updatedMedia.slug,
      size: updatedMedia.size || 0,
      mimeType: `image/${updatedMedia.slug.split('.').pop()}`,
      createdAt: updatedMedia.date || new Date().toISOString()
    };

    return NextResponse.json(transformedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
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
    const mediaRepo = MediaRepository.getInstance();
    const success = await mediaRepo.deleteMedia(slug);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
