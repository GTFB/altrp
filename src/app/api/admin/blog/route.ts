import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { frontmatterSchema } from '@/lib/validators/content.schema';

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

    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const postPath = path.join(contentDir, body.slug);

    // Check if post already exists
    try {
      await fs.access(postPath);
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      );
    } catch {
      // Path doesn't exist, which is good
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
      media: body.media,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
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

    // Create post directory
    await fs.mkdir(postPath, { recursive: true });
    
    // Write the post file
    await fs.writeFile(path.join(postPath, 'index.mdx'), mdxContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    const posts = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const slug = entry.name;
        const postPath = path.join(contentDir, slug, 'index.mdx');
        
        try {
          const raw = await fs.readFile(postPath, 'utf8');
          const { data } = matter(raw);
          
          posts.push({
            slug,
            title: data.title,
            date: data.date,
            author: data.author,
            category: data.category,
            tags: data.tags || [],
            excerpt: data.excerpt,
          });
        } catch (error) {
          console.warn(`Could not read post ${slug}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      posts: posts.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
