import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';
import { CategoryRepository } from '@/repositories/category.repository';
import { AuthorRepository } from '@/repositories/author.repository';
import { PageRepository } from '@/repositories/page.repository';

interface ContentInfo {
  title: string;
  type: 'post' | 'category' | 'author' | 'page';
  slug: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const type = searchParams.get('type');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    let contentInfo: ContentInfo | null = null;

    // Try to find content by type or search in all repositories
    if (!type || type === 'post') {
      const postRepository = PostRepository.getInstance();
      const post = await postRepository.findBySlug(slug);
      if (post) {
        contentInfo = {
          title: post.title,
          type: 'post',
          slug: post.slug
        };
      }
    }

    if (!contentInfo && (!type || type === 'category')) {
      const categoryRepository = CategoryRepository.getInstance();
      const category = await categoryRepository.findBySlug(slug);
      if (category) {
        contentInfo = {
          title: category.title,
          type: 'category',
          slug: category.slug
        };
      }
    }

    if (!contentInfo && (!type || type === 'author')) {
      const authorRepository = AuthorRepository.getInstance();
      const author = await authorRepository.findBySlug(slug);
      if (author) {
        contentInfo = {
          title: author.name,
          type: 'author',
          slug: author.slug
        };
      }
    }

    if (!contentInfo && (!type || type === 'page')) {
      const pageRepository = PageRepository.getInstance();
      const page = await pageRepository.findBySlug(slug);
      if (page) {
        contentInfo = {
          title: page.title,
          type: 'page',
          slug: page.slug
        };
      }
    }

    if (!contentInfo) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(contentInfo);

  } catch (error) {
    console.error('Content info API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
