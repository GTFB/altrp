import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

const authorSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

interface UpdateAuthorRequest {
  name: string;
  avatar?: string;
  bio?: string;
  content: string;
  newSlug?: string; // If provided, will rename the file
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body: UpdateAuthorRequest = await request.json();
    const { slug } = params;
    
    // Validate required fields
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const currentAuthorPath = path.join(contentDir, `${slug}.mdx`);

    // Check if author exists
    try {
      await fs.access(currentAuthorPath);
    } catch {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // If newSlug is provided and different from current slug, check uniqueness
    if (body.newSlug && body.newSlug !== slug) {
      const newAuthorPath = path.join(contentDir, `${body.newSlug}.mdx`);
      
      try {
        await fs.access(newAuthorPath);
        return NextResponse.json(
          { error: 'Author with this slug already exists' },
          { status: 409 }
        );
      } catch {
        // Path doesn't exist, which is good
      }
    }

    // Prepare frontmatter
    const frontmatter = {
      name: body.name,
      avatar: body.avatar,
      bio: body.bio,
    };

    // Validate frontmatter
    const validatedFrontmatter = authorSchema.parse(frontmatter);

    // Prepare content
    const mdxContent = `---\n${Object.entries(validatedFrontmatter)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
      })
      .join('\n')}\n---\n\n${body.content}`;

    // If slug is changing, rename the file
    if (body.newSlug && body.newSlug !== slug) {
      const newAuthorPath = path.join(contentDir, `${body.newSlug}.mdx`);
      
      // Write new file
      await fs.writeFile(newAuthorPath, mdxContent, 'utf8');
      
      // Remove old file
      await fs.unlink(currentAuthorPath);
      
      return NextResponse.json({
        success: true,
        message: 'Author updated and renamed successfully',
        slug: body.newSlug,
        oldSlug: slug
      });
    } else {
      // Just update the content
      await fs.writeFile(currentAuthorPath, mdxContent, 'utf8');
      
      return NextResponse.json({
        success: true,
        message: 'Author updated successfully',
        slug: slug
      });
    }

  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { error: 'Failed to update author' },
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
    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const authorPath = path.join(contentDir, `${slug}.mdx`);

    // Check if author exists
    try {
      await fs.access(authorPath);
    } catch {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Read the author file
    const raw = await fs.readFile(authorPath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      author: {
        slug,
        name: data.name,
        avatar: data.avatar,
        bio: data.bio,
        content: content,
      }
    });

  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author' },
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
    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const authorPath = path.join(contentDir, `${slug}.mdx`);

    // Check if author exists
    try {
      await fs.access(authorPath);
    } catch {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Remove the author file
    await fs.unlink(authorPath);

    return NextResponse.json({
      success: true,
      message: 'Author deleted successfully',
      slug: slug
    });

  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { error: 'Failed to delete author' },
      { status: 500 }
    );
  }
}
