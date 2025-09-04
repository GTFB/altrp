import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    const sortBy = (searchParams.get('sortBy') as 'date' | 'title' | 'created') || 'date';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const postRepo = new PostRepository();
    
    // Use new filtering and sorting methods
    const posts = await postRepo.findWithFilters(
      {
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        author: author || undefined,
        search: search || undefined,
      },
      {
        field: sortBy,
        order: sortOrder,
      }
    );

    // Apply limit
    const limitedPosts = posts.slice(0, limit);

    return NextResponse.json({
      posts: limitedPosts,
      total: posts.length,
      hasMore: posts.length > limit
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
