import { NextRequest, NextResponse } from 'next/server';
import { CategoryRepository } from '@/repositories/category.repository';
import { htmlToMarkdown } from '@/lib/html-to-markdown';

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

    const categoryRepository = CategoryRepository.getInstance();
    
    // Convert HTML content to Markdown
    const markdownContent = htmlToMarkdown(body.content);

    const categoryData = {
      slug: body.slug,
      title: body.title,
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      excerpt: body.excerpt,
      content: markdownContent,
    };

    const createdCategory = await categoryRepository.createCategory(categoryData);

    if (!createdCategory) {
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      slug: body.slug
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categoryRepository = CategoryRepository.getInstance();
    const categories = await categoryRepository.findAll();

    // Return only basic info for the list view
    const categoriesList = categories.map(category => ({
      slug: category.slug,
      title: category.title,
      date: category.date,
      tags: category.tags || [],
      excerpt: category.excerpt,
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesList
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
