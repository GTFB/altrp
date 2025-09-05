import { NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';

export async function GET() {
  try {
    const postRepo = PostRepository.getInstance();
    const categories = await postRepo.findAllCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
