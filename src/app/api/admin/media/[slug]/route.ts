import { NextRequest, NextResponse } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const mediaRepo = MediaRepository.getInstance();
    const media = await mediaRepo.findBySlug(params.slug);

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(media);
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
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const mediaRepo = MediaRepository.getInstance();
    
    const updatedMedia = await mediaRepo.updateMedia(params.slug, body);
    
    if (!updatedMedia) {
      return NextResponse.json(
        { error: 'Failed to update media' },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedMedia);
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
  { params }: { params: { slug: string } }
) {
  try {
    const mediaRepo = MediaRepository.getInstance();
    const success = await mediaRepo.deleteMedia(params.slug);
    
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
