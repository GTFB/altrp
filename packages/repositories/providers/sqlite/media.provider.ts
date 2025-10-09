import type { MediaDataProvider } from "@/types/providers";
import type { Media, MediaFilters, MediaSortOptions } from "@/types/media";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";

export class SqliteMediaProvider implements MediaDataProvider {
  async findAll(): Promise<Media[]> {
    const rows = await db.select().from(media);
    return rows.map((r) => ({
      slug: r.slug!,
      title: r.title!,
      description: r.description ?? undefined,
      date: r.date ?? undefined,
      url: r.url!,
      alt: r.alt ?? undefined,
      type: r.type as any,
      size: r.size ?? undefined,
      width: r.width ?? undefined,
      height: r.height ?? undefined,
      duration: r.duration ?? undefined,
      content: r.contentMarkdown ?? undefined,
      tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
    }));
  }

  async findWithFilters(
    filters: MediaFilters = {},
    _sort: MediaSortOptions = { field: "title", order: "asc" },
  ): Promise<Media[]> {
    let all = await this.findAll();
    if (filters.type) all = all.filter((m) => m.type === filters.type);
    if (filters.tags?.length)
      all = all.filter((m) => m.tags?.some((t) => filters.tags!.includes(t)));
    if (filters.minSize)
      all = all.filter((m) => (m.size ?? 0) >= filters.minSize!);
    if (filters.maxSize)
      all = all.filter((m) => (m.size ?? 0) <= filters.maxSize!);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.alt?.toLowerCase().includes(q),
      );
    }
    return all;
  }

  async findBySlug(slug: string): Promise<Media | null> {
    const rows = await db
      .select()
      .from(media)
      .where(eq(media.slug, slug))
      .limit(1);
    const r = rows[0];
    if (!r) return null;
    return {
      slug: r.slug!,
      title: r.title!,
      description: r.description ?? undefined,
      date: r.date ?? undefined,
      url: r.url!,
      alt: r.alt ?? undefined,
      type: r.type as any,
      size: r.size ?? undefined,
      width: r.width ?? undefined,
      height: r.height ?? undefined,
      duration: r.duration ?? undefined,
      content: r.contentMarkdown ?? undefined,
      tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
    };
  }

  async findAllTypes(): Promise<string[]> {
    const rows = await db.select({ type: media.type }).from(media);
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.type) set.add(r.type);
    });
    return Array.from(set).sort();
  }

  async findAllTags(): Promise<string[]> {
    const rows = await db.select({ tagsJson: media.tagsJson }).from(media);
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.tagsJson) JSON.parse(r.tagsJson).forEach((t: string) => set.add(t));
    });
    return Array.from(set).sort();
  }

  async findByType(type: NonNullable<Media["type"]>): Promise<Media[]> {
    const rows = await db
      .select()
      .from(media)
      .where(eq(media.type, type))
      .limit(1000);
    return rows.map((r) => ({
      slug: r.slug!,
      title: r.title!,
      url: r.url!,
      type: r.type as any,
      description: r.description ?? undefined,
      date: r.date ?? undefined,
      alt: r.alt ?? undefined,
      size: r.size ?? undefined,
      width: r.width ?? undefined,
      height: r.height ?? undefined,
      duration: r.duration ?? undefined,
      content: r.contentMarkdown ?? undefined,
      tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
    }));
  }

  async findByTag(tag: string): Promise<Media[]> {
    const all = await this.findAll();
    return all.filter((m) => m.tags?.includes(tag));
  }

  async searchMedia(query: string): Promise<Media[]> {
    const all = await this.findAll();
    const q = query.toLowerCase();
    return all.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.alt?.toLowerCase().includes(q),
    );
  }

  async createMedia(
    mediaData: Omit<Media, "slug"> & { slug: string },
  ): Promise<Media | null> {
    await db.insert(media).values({
      slug: mediaData.slug,
      title: mediaData.title,
      description: mediaData.description,
      date: mediaData.date,
      url: mediaData.url,
      alt: mediaData.alt,
      type: mediaData.type as any,
      size: mediaData.size,
      width: mediaData.width,
      height: mediaData.height,
      duration: mediaData.duration,
      contentMarkdown: mediaData.content,
      tagsJson: mediaData.tags ? JSON.stringify(mediaData.tags) : null,
    });
    return this.findBySlug(mediaData.slug);
  }

  async updateMedia(
    oldSlug: string,
    updates: Partial<Media>,
  ): Promise<Media | null> {
    const existing = await this.findBySlug(oldSlug);
    if (!existing) return null;
    const newSlug = (updates as any).slug || oldSlug;
    await db.delete(media).where(eq(media.slug, oldSlug));
    await this.createMedia({ ...existing, ...updates, slug: newSlug });
    return this.findBySlug(newSlug);
  }

  async deleteMedia(slug: string): Promise<boolean> {
    await db.delete(media).where(eq(media.slug, slug));
    return true;
  }

  async getMediaStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalSize: number;
    averageSize: number;
  }> {
    const items = await this.findAll();
    const stats = {
      total: items.length,
      byType: {} as Record<string, number>,
      totalSize: 0,
      averageSize: 0,
    };
    items.forEach((m) => {
      const t = m.type || "unknown";
      stats.byType[t] = (stats.byType[t] || 0) + 1;
      if (m.size) stats.totalSize += m.size;
    });
    stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;
    return stats;
  }
}
