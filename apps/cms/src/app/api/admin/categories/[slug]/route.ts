import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

const categorySchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
});

interface UpdateCategoryRequest {
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  newSlug?: string; // If provided, will rename the file
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body: UpdateCategoryRequest = await request.json();
    const { slug } = await params;
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const contentDir = path.join(process.cwd(), 'content', 'categories');
    const currentCategoryPath = path.join(contentDir, `${slug}.mdx`);

    // Check if category exists
    try {
      await fs.access(currentCategoryPath);
    } catch {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If newSlug is provided and different from current slug, check uniqueness
    if (body.newSlug && body.newSlug !== slug) {
      const newCategoryPath = path.join(contentDir, `${body.newSlug}.mdx`);
      
      try {
        await fs.access(newCategoryPath);
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        );
      } catch {
        // Path doesn't exist, which is good
      }
    }

    // Prepare frontmatter
    const frontmatter = {
      title: body.title,
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      excerpt: body.excerpt,
    };

    // Validate frontmatter
    const validatedFrontmatter = categorySchema.parse(frontmatter);

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

    // If slug is changing, rename the file
    if (body.newSlug && body.newSlug !== slug) {
      const newCategoryPath = path.join(contentDir, `${body.newSlug}.mdx`);
      
      // Write new file
      await fs.writeFile(newCategoryPath, mdxContent, 'utf8');
      
      // Remove old file
      await fs.unlink(currentCategoryPath);
      
      return NextResponse.json({
        success: true,
        message: 'Category updated and renamed successfully',
        slug: body.newSlug,
        oldSlug: slug
      });
    } else {
      // Just update the content
      await fs.writeFile(currentCategoryPath, mdxContent, 'utf8');
      
      return NextResponse.json({
        success: true,
        message: 'Category updated successfully',
        slug: slug
      });
    }

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
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
    const contentDir = path.join(process.cwd(), 'content', 'categories');
    const categoryPath = path.join(contentDir, `${slug}.mdx`);

    // Check if category exists
    try {
      await fs.access(categoryPath);
    } catch {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Read the category file
    const raw = await fs.readFile(categoryPath, 'utf8');
    const { data, content } = matter(raw);

    return NextResponse.json({
      success: true,
      category: {
        slug,
        title: data.title,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        content: content,
      }
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
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
    const contentDir = path.join(process.cwd(), 'content', 'categories');
    const categoryPath = path.join(contentDir, `${slug}.mdx`);

    // Check if category exists
    try {
      await fs.access(categoryPath);
    } catch {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Remove the category file
    await fs.unlink(categoryPath);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      slug: slug
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
