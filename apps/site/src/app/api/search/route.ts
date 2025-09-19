import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/repositories/post.repository';
import { CategoryRepository } from '@/repositories/category.repository';
import { AuthorRepository } from '@/repositories/author.repository';
import { PageRepository } from '@/repositories/page.repository';

interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  type: 'post' | 'category' | 'author' | 'page';
  url: string;
  excerpt?: string;
  tags?: string[];
  score?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // filter by type

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const results: SearchResultItem[] = [];

    // Search posts
    if (!type || type === 'post') {
      const postRepository = PostRepository.getInstance();
      const postResults = await postRepository.search(query, { limit: limit * 2 });
      
      for (const result of postResults) {
        results.push({
          id: result.item.slug,
          title: result.item.title,
          description: result.item.description,
          type: 'post',
          url: `/blog/${result.item.slug}`,
          excerpt: result.item.excerpt,
          tags: result.item.tags,
          score: result.score,
        });
      }
    }

    // Search categories
    if (!type || type === 'category') {
      const categoryRepository = CategoryRepository.getInstance();
      const categories = await categoryRepository.findAll();
      
      const filteredCategories = categories.filter(category =>
        category.title.toLowerCase().includes(query.toLowerCase()) ||
        category.description?.toLowerCase().includes(query.toLowerCase())
      );

      for (const category of filteredCategories) {
        results.push({
          id: category.slug,
          title: category.title,
          description: category.description,
          type: 'category',
          url: `/categories/${category.slug}`,
        });
      }
    }

    // Search authors
    if (!type || type === 'author') {
      const authorRepository = AuthorRepository.getInstance();
      const authors = await authorRepository.findAll();
      
      const filteredAuthors = authors.filter(author =>
        author.name.toLowerCase().includes(query.toLowerCase()) ||
        author.bio?.toLowerCase().includes(query.toLowerCase())
      );

      for (const author of filteredAuthors) {
        results.push({
          id: author.slug,
          title: author.name,
          description: author.bio,
          type: 'author',
          url: `/authors/${author.slug}`,
        });
      }
    }

    // Search pages
    if (!type || type === 'page') {
      const pageRepository = PageRepository.getInstance();
      const pages = await pageRepository.findAll();
      
      const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.description?.toLowerCase().includes(query.toLowerCase())
      );

      for (const page of filteredPages) {
        results.push({
          id: page.slug,
          title: page.title,
          description: page.description,
          type: 'page',
          url: `/${page.slug}`,
        });
      }
    }

    // Sort by score (highest first) and limit results
    const sortedResults = results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return NextResponse.json({
      results: sortedResults,
      total: sortedResults.length,
      query,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', results: [], total: 0 },
      { status: 500 }
    );
  }
}
