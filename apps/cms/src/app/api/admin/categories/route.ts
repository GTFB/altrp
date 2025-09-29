import { NextResponse } from 'next/server';
import { CategoryRepository } from '@/repositories/category.repository';

export async function GET() {
  try {
    const categoryRepo = CategoryRepository.getInstance();
    const categories = await categoryRepo.findAll();

    return NextResponse.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}