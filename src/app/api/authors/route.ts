import { NextResponse } from 'next/server';
import { AuthorRepository } from '@/repositories/author.repository';

export async function GET() {
  try {
    const authorRepo = new AuthorRepository();
    const authors = await authorRepo.findAll();

    return NextResponse.json({ authors });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}
