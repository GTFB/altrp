import type { PageDataProvider } from "@/types/providers";
import type { Page, PageFilters, PageSortOptions } from "@/types/page";
import { db } from "@/packages/db/cms/client";
import { pages } from "@/packages/db/cms/schema";
import { eq } from "drizzle-orm";
import { parseMarkdown } from "@/lib/markdown";

export class SqlitePageProvider implements PageDataProvider {
  async findAll(): Promise<Page[]> {
    const rows = await db.select().from(pages);
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
        media: r.media ?? undefined,
        seoTitle: r.seoTitle ?? undefined,
        seoDescription: r.seoDescription ?? undefined,
        seoKeywords: r.seoKeywords ?? undefined,
        tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
      })),
    );
  }

  async findWithFilters(
    _filters: PageFilters = {},
    _sort: PageSortOptions = { field: "title", order: "asc" },
  ): Promise<Page[]> {
    const all = await this.findAll();
    return all;
  }

  async findBySlug(slug: string): Promise<Page | null> {
    const rows = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
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
      media: r.media ?? undefined,
      seoTitle: r.seoTitle ?? undefined,
      seoDescription: r.seoDescription ?? undefined,
      seoKeywords: r.seoKeywords ?? undefined,
      tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
    };
  }

  async findAllTags(): Promise<string[]> {
    const rows = await db.select({ tagsJson: pages.tagsJson }).from(pages);
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.tagsJson) JSON.parse(r.tagsJson).forEach((t: string) => set.add(t));
    });
    return Array.from(set).sort();
  }

  async findByTag(tag: string): Promise<Page[]> {
    const all = await this.findAll();
    return all.filter((p) => p.tags?.includes(tag));
  }

  async searchPages(query: string): Promise<Page[]> {
    const all = await this.findAll();
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q),
    );
  }

  async createPage(
    pageData: Omit<Page, "slug"> & { slug: string },
  ): Promise<Page | null> {
    await db.insert(pages).values({
      slug: pageData.slug,
      title: pageData.title,
      description: pageData.description,
      date: pageData.date,
      excerpt: pageData.excerpt,
      contentMarkdown: pageData.content,
      media: pageData.media,
      seoTitle: pageData.seoTitle,
      seoDescription: pageData.seoDescription,
      seoKeywords: pageData.seoKeywords,
      tagsJson: pageData.tags ? JSON.stringify(pageData.tags) : null,
    });
    return this.findBySlug(pageData.slug);
  }

  async updatePage(
    oldSlug: string,
    updates: Partial<Page>,
  ): Promise<Page | null> {
    const existing = await this.findBySlug(oldSlug);
    if (!existing) return null;
    const newSlug = (updates as any).slug || oldSlug;
    await db.delete(pages).where(eq(pages.slug, oldSlug));
    await this.createPage({ ...existing, ...updates, slug: newSlug });
    return this.findBySlug(newSlug);
  }

  async deletePage(slug: string): Promise<boolean> {
    await db.delete(pages).where(eq(pages.slug, slug));
    return true;
  }
}
