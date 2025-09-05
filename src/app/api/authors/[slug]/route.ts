import { NextRequest, NextResponse } from 'next/server';
import { AuthorRepository } from '@/repositories/author.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authorRepo = new AuthorRepository();
    const author = await authorRepo.findBySlug(params.slug);

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
