import type { PostDataProvider } from "@/types/providers";
import type {
  Post,
  PostFilters,
  PostSortOptions,
  PaginationOptions,
  PaginatedResult,
} from "@/types/post";
import { db } from "@/packages/db/cms/client";
import { posts } from "@/packages/db/cms/schema";
import { and, eq } from "drizzle-orm";
import { parseMarkdown } from "@/lib/markdown";
import { PROJECT_SETTINGS } from "@/settings";

export class SqlitePostProvider implements PostDataProvider {
  async findAll(): Promise<Post[]> {
    const rows = await db.select().from(posts);
    return Promise.all(
      rows.map(async (r) => ({
        slug: r.slug!,
        title: r.title!,
        description: r.description ?? undefined,
        date: r.date ?? undefined,
        excerpt: r.excerpt ?? undefined,
        content: r.contentMarkdown
          ? await parseMarkdown(r.contentMarkdown)
          : undefined,
        category: r.category ?? undefined,
        author: r.author ?? undefined,
        media: r.media ?? undefined,
        seoTitle: r.seoTitle ?? undefined,
        seoDescription: r.seoDescription ?? undefined,
        seoKeywords: r.seoKeywords ?? undefined,
        tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
      })),
    );
  }

  async findWithFilters(
    filters: PostFilters = {},
    _sort: PostSortOptions = { field: "date", order: "desc" },
  ): Promise<Post[]> {
    let all = await this.findAll();
    if (filters.category)
      all = all.filter((p) => p.category === filters.category);
    if (filters.author) all = all.filter((p) => p.author === filters.author);
    if (filters.tags?.length)
      all = all.filter((p) => p.tags?.some((t) => filters.tags!.includes(t)));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q),
      );
    }
    return all;
  }

  async findWithPagination(
    filters: PostFilters = {},
    sort: PostSortOptions = { field: "date", order: "desc" },
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<Post>> {
    const all = await this.findWithFilters(filters, sort);
    const total = all.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const items = all.slice(start, start + pagination.limit);
    return {
      data: items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };
  }

  async findBySlug(
    slug: string,
    locale: string = PROJECT_SETTINGS.defaultLanguage,
  ): Promise<Post | null> {
    const rows = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.locale, locale)))
      .limit(1);
    const r = rows[0];
    if (!r) return null;
    return {
      slug: r.slug!,
      title: r.title!,
      description: r.description ?? undefined,
      date: r.date ?? undefined,
      excerpt: r.excerpt ?? undefined,
      content: r.contentMarkdown
        ? await parseMarkdown(r.contentMarkdown)
        : undefined,
      category: r.category ?? undefined,
      author: r.author ?? undefined,
      media: r.media ?? undefined,
      seoTitle: r.seoTitle ?? undefined,
      seoDescription: r.seoDescription ?? undefined,
      seoKeywords: r.seoKeywords ?? undefined,
      tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
    };
  }

  async findAllCategories(): Promise<string[]> {
    const rows = await db.select({ category: posts.category }).from(posts);
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }

  async findAllAuthors(): Promise<string[]> {
    const rows = await db.select({ author: posts.author }).from(posts);
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.author) set.add(r.author);
    });
    return Array.from(set).sort();
  }

  async findByCategory(category: string): Promise<Post[]> {
    const all = await this.findAll();
    return all.filter((p) => p.category === category);
  }

  async findByAuthor(author: string): Promise<Post[]> {
    const all = await this.findAll();
    return all.filter((p) => p.author === author);
  }

  async findByTag(tag: string): Promise<Post[]> {
    const all = await this.findAll();
    return all.filter((p) => p.tags?.includes(tag));
  }

  async findAllTags(): Promise<Array<{ tag: string; count: number }>> {
    const rows = await db.select({ tagsJson: posts.tagsJson }).from(posts);
    const counts = new Map<string, number>();
    rows.forEach((r) => {
      if (r.tagsJson)
        JSON.parse(r.tagsJson).forEach((t: string) =>
          counts.set(t, (counts.get(t) || 0) + 1),
        );
    });
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  async search(
    query: string,
  ): Promise<
    { item: Post; score?: number | undefined; matches?: string[] | undefined }[]
  > {
    const all = await this.findAll();
    const q = query.toLowerCase();
    const items = all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q),
    );
    return items.map((i) => ({ item: i, score: 1 }));
  }

  async createPost(
    postData: Omit<Post, "slug"> & { slug: string },
  ): Promise<Post | null> {
    await db.insert(posts).values({
      slug: postData.slug,
      locale: PROJECT_SETTINGS.defaultLanguage,
      title: postData.title,
      description: postData.description,
      date: postData.date,
      excerpt: postData.excerpt,
      contentMarkdown: postData.content,
      category: postData.category,
      author: postData.author,
      media: postData.media,
      seoTitle: postData.seoTitle,
      seoDescription: postData.seoDescription,
      seoKeywords: postData.seoKeywords,
      tagsJson: postData.tags ? JSON.stringify(postData.tags) : null,
    });
    return this.findBySlug(postData.slug, PROJECT_SETTINGS.defaultLanguage);
  }

  async updatePost(
    oldSlug: string,
    updates: Partial<Post>,
  ): Promise<Post | null> {
    const existing = await this.findBySlug(oldSlug);
    if (!existing) return null;
    const newSlug = (updates as any).slug || oldSlug;
    await db.delete(posts).where(eq(posts.slug, oldSlug));
    await this.createPost({ ...existing, ...updates, slug: newSlug });
    return this.findBySlug(newSlug);
  }

  async deletePost(slug: string): Promise<boolean> {
    await db.delete(posts).where(eq(posts.slug, slug));
    return true;
  }
}
