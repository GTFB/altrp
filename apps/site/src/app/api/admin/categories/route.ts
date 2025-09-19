import { NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';

export async function GET() {
  try {
    const postRepo = PostRepository.getInstance();
    const categories = await postRepo.findAllCategories();

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