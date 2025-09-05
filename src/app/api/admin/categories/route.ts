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

interface CreateCategoryRequest {
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  slug: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();
    
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

    const contentDir = path.join(process.cwd(), 'content', 'categories');
    const categoryPath = path.join(contentDir, `${body.slug}.mdx`);

    // Check if category already exists
    try {
      await fs.access(categoryPath);
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    } catch {
      // Path doesn't exist, which is good
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

    // Write the category file
    await fs.writeFile(categoryPath, mdxContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'categories');
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    const categories = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.mdx')) {
        const slug = entry.name.replace('.mdx', '');
        const categoryPath = path.join(contentDir, entry.name);
        
        try {
          const raw = await fs.readFile(categoryPath, 'utf8');
          const { data } = matter(raw);
          
          categories.push({
            slug,
            title: data.title,
            date: data.date,
            tags: data.tags || [],
            excerpt: data.excerpt,
          });
        } catch (error) {
          console.warn(`Could not read category ${slug}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      categories: categories.sort((a, b) => a.title.localeCompare(b.title))
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
