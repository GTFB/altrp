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

interface CreateAuthorRequest {
  name: string;
  avatar?: string;
  bio?: string;
  content: string;
  slug: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAuthorRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.content || !body.slug) {
      return NextResponse.json(
        { error: 'Name, content, and slug are required' },
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

    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const authorPath = path.join(contentDir, `${body.slug}.mdx`);

    // Check if author already exists
    try {
      await fs.access(authorPath);
      return NextResponse.json(
        { error: 'Author with this slug already exists' },
        { status: 409 }
      );
    } catch {
      // Path doesn't exist, which is good
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

    // Write the author file
    await fs.writeFile(authorPath, mdxContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Author created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'authors');
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    const authors = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.mdx')) {
        const slug = entry.name.replace('.mdx', '');
        const authorPath = path.join(contentDir, entry.name);
        
        try {
          const raw = await fs.readFile(authorPath, 'utf8');
          const { data } = matter(raw);
          
          authors.push({
            slug,
            name: data.name,
            avatar: data.avatar,
            bio: data.bio,
          });
        } catch (error) {
          console.warn(`Could not read author ${slug}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      authors: authors.sort((a, b) => a.name.localeCompare(b.name))
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}
