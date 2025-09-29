import { NextRequest, NextResponse } from 'next/server';
import { CategoryRepository } from '@/repositories/category.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const categoryRepo = CategoryRepository.getInstance();
    const category = await categoryRepo.findBySlug(params.slug);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
