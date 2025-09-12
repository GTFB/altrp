import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';
import { htmlToMarkdown } from '@/lib/html-to-markdown';

interface CreatePostRequest {
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
  slug: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePostRequest = await request.json();
    
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

    const postRepository = PostRepository.getInstance();
    
    // Convert HTML content to Markdown
    const markdownContent = htmlToMarkdown(body.content);

    const postData = {
      slug: body.slug,
      title: body.title,
      description: body.description,
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      excerpt: body.excerpt,
      content: markdownContent,
      category: body.category,
      author: body.author,
      media: body.media,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
    };

    const createdPost = await postRepository.createPost(postData);

    if (!createdPost) {
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const author = searchParams.get('author') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortField = (searchParams.get('sortField') as 'date' | 'title' | 'created') || 'date';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const postRepository = PostRepository.getInstance();
    
    const result = await postRepository.findWithPagination(
      {
        category,
        author,
        search,
      },
      {
        field: sortField,
        order: sortOrder,
      },
      {
        page,
        limit,
      }
    );

    // Return only basic info for the list view
    const postsList = result.data.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      author: post.author,
      category: post.category,
      tags: post.tags || [],
      excerpt: post.excerpt,
    }));

    return NextResponse.json({
      success: true,
      posts: postsList,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
