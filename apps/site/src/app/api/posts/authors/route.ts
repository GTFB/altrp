import { NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';

export async function GET() {
  try {
    const postRepo = PostRepository.getInstance();
    const authors = await postRepo.findAllAuthors();

    return NextResponse.json({ authors });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}
