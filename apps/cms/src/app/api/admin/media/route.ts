import { NextRequest, NextResponse } from 'next/server';
import { MediaRepository } from '@/repositories/media.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '18');
    const type = searchParams.get('type') as 'image' | 'video' | 'document' | 'audio' | null;
    const tags = searchParams.get('tags')?.split(',') || [];
    const search = searchParams.get('search') || '';
    const minSize = searchParams.get('minSize') ? parseInt(searchParams.get('minSize')!) : undefined;
    const maxSize = searchParams.get('maxSize') ? parseInt(searchParams.get('maxSize')!) : undefined;
    const sortBy = (searchParams.get('sortBy') as 'date' | 'title' | 'size' | 'created') || 'created';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const mediaRepo = MediaRepository.getInstance();
    
    // Get all media with filters
    const allMedia = await mediaRepo.findWithFilters(
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

    // Filter out logo.svg from the results
    const filteredMedia = allMedia.filter(item => item.slug !== 'logo.svg');

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const mediaItems = filteredMedia.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredMedia.length;

    // Transform media items to match frontend interface
    const transformedMedia = mediaItems.map(item => ({
      id: item.slug,
      slug: item.slug,
      url: item.url,
      alt: item.alt,
      title: item.title,
      description: item.description,
      filename: item.slug,
      type: item.type,
      size: item.size || 0,
      mimeType: `image/${item.slug.split('.').pop()}`,
      createdAt: item.date || new Date().toISOString()
    }));

    return NextResponse.json({ 
      media: transformedMedia,
      hasMore,
      total: filteredMedia.length,
      page,
      limit
    });
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Use the existing upload logic
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/admin/media/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Upload failed' },
        { status: uploadResponse.status }
      );
    }

    const uploadData = await uploadResponse.json();
    
    // Transform the response to match our interface
    const transformedMedia = {
      id: uploadData.media.slug,
      slug: uploadData.media.slug,
      url: uploadData.media.url,
      alt: uploadData.media.alt,
      title: uploadData.media.title,
      description: uploadData.media.description,
      filename: uploadData.media.slug,
      type: uploadData.media.type,
      size: uploadData.media.size || 0,
      mimeType: file.type,
      createdAt: uploadData.media.date || new Date().toISOString()
    };

    return NextResponse.json(transformedMedia, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
