import { NextRequest, NextResponse } from 'next/server';
import { AuthorRepository } from '@/repositories/author.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const authorRepo = AuthorRepository.getInstance();
    const author = await authorRepo.findBySlug(slug);

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    );
  }
}
