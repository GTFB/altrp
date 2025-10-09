import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';


interface UpdatePostRequest {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  category?: string;
  author?: string;
  media?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  newSlug?: string; // If provided, will rename the folder
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body: UpdatePostRequest = await request.json();
    const { slug } = await params;

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await PostRepository.getInstance().findBySlug(slug);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If newSlug is provided and different from current slug, check uniqueness
    if (body.newSlug && body.newSlug !== slug) {
      const existingWithNewSlug = await PostRepository.getInstance().findBySlug(body.newSlug);
      if (existingWithNewSlug) {
        return NextResponse.json(
          { error: 'Post with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare updates
    const updates = {
      title: body.title,
      description: body.description,
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      author: body.author,
      media: body.media,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
      slug: body.newSlug || slug,
    };

    // Update using repository
    const updatedPost = await PostRepository.getInstance().updatePost(slug, updates);

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.newSlug && body.newSlug !== slug 
        ? 'Post updated and renamed successfully' 
        : 'Post updated successfully',
      slug: body.newSlug || slug,
      oldSlug: slug
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await PostRepository.getInstance().findBySlug(slug);
    // Check if post exists
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
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

    // Check if post exists
    const post = await PostRepository.getInstance().findBySlug(slug);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete the post using repository
    const success = await PostRepository.getInstance().deletePost(slug);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      slug: slug
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
