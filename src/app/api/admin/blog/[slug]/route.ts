import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { frontmatterSchema } from '@/lib/validators/content.schema';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

interface UpdatePostRequest {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  category?: string;
  author?: string;
  newSlug?: string; // If provided, will rename the folder
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body: UpdatePostRequest = await request.json();
    const { slug } = params;
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const currentPostPath = path.join(contentDir, slug);
    const currentIndexPath = path.join(currentPostPath, 'index.mdx');

    // Check if post exists
    try {
      await fs.access(currentIndexPath);
    } catch {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If newSlug is provided and different from current slug, check uniqueness
    if (body.newSlug && body.newSlug !== slug) {
      const newPostPath = path.join(contentDir, body.newSlug);
      
      try {
        await fs.access(newPostPath);
        return NextResponse.json(
          { error: 'Post with this slug already exists' },
          { status: 409 }
        );
      } catch {
        // Path doesn't exist, which is good
      }
    }

    // Prepare frontmatter
    const frontmatter = {
      title: body.title,
      description: body.description,
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      excerpt: body.excerpt,
      category: body.category,
      author: body.author,
    };

    // Validate frontmatter
    const validatedFrontmatter = frontmatterSchema.parse(frontmatter);

    // Prepare content
    const mdxContent = `---\n${Object.entries(validatedFrontmatter)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
      })
      .join('\n')}\n---\n\n${body.content}`;

    // If slug is changing, rename the folder
    if (body.newSlug && body.newSlug !== slug) {
      const newPostPath = path.join(contentDir, body.newSlug);
      
      // Create new directory
      await fs.mkdir(newPostPath, { recursive: true });
      
      // Write new file
      await fs.writeFile(path.join(newPostPath, 'index.mdx'), mdxContent, 'utf8');
      
      // Remove old directory
      await fs.rmdir(currentPostPath, { recursive: true });
      
      return NextResponse.json({
        success: true,
        message: 'Post updated and renamed successfully',
        slug: body.newSlug,
        oldSlug: slug
      });
    } else {
      // Just update the content
      await fs.writeFile(currentIndexPath, mdxContent, 'utf8');
      
      return NextResponse.json({
        success: true,
        message: 'Post updated successfully',
        slug: slug
      });
    }

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
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const postPath = path.join(contentDir, slug, 'index.mdx');

    // Check if post exists
    try {
      await fs.access(postPath);
    } catch {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Read the post file
    const raw = await fs.readFile(postPath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      post: {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        content: content,
        category: data.category,
        author: data.author,
      }
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
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const postPath = path.join(contentDir, slug);

    // Check if post exists
    try {
      await fs.access(postPath);
    } catch {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Remove the post directory
    await fs.rmdir(postPath, { recursive: true });

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
