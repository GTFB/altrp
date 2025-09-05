import { NextRequest, NextResponse } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'image' | 'video' | 'document' | 'audio' | null;
    const tags = searchParams.get('tags')?.split(',') || [];
    const search = searchParams.get('search') || '';
    const minSize = searchParams.get('minSize') ? parseInt(searchParams.get('minSize')!) : undefined;
    const maxSize = searchParams.get('maxSize') ? parseInt(searchParams.get('maxSize')!) : undefined;
    const sortBy = (searchParams.get('sortBy') as 'date' | 'title' | 'size' | 'created') || 'title';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';

    const mediaRepo = MediaRepository.getInstance();
    
    // Use filtering and sorting methods
    const mediaItems = await mediaRepo.findWithFilters(
      {
        type: type || undefined,
        tags: tags.length > 0 ? tags : undefined,
        search: search || undefined,
        minSize,
        maxSize,
      },
      {
        field: sortBy,
        order: sortOrder,
      }
    );

    return NextResponse.json({ media: mediaItems });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mediaRepo = MediaRepository.getInstance();
    
    const newMedia = await mediaRepo.createMedia(body);
    
    if (!newMedia) {
      return NextResponse.json(
        { error: 'Failed to create media' },
        { status: 400 }
      );
    }

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json(
      { error: 'Failed to create media' },
      { status: 500 }
    );
  }
}
