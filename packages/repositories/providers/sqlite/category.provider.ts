import type { CategoryDataProvider } from "@/types/providers";
import type { Category } from "@/types/category";
const loadDb = async () => (await import("../../../../apps/cms/src/db/client")).db;
const loadCategories = async () => (await import("../../../../apps/cms/src/db/schema")).categories;
import { eq } from "drizzle-orm";

export class SqliteCategoryProvider implements CategoryDataProvider {
  async findAll(): Promise<Category[]> {
    const db = await loadDb();
    const categories = await loadCategories();
    const rows = await db.select().from(categories);
    return rows.map((r) => ({
      slug: r.slug!,
      title: r.title!,
      date: r.date ?? undefined,
      excerpt: r.excerpt ?? undefined,
      content: r.contentMarkdown ?? undefined,
      tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
    }));
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const db = await loadDb();
    const categories = await loadCategories();
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    const r = rows[0];
    return r
      ? {
          slug: r.slug!,
          title: r.title!,
          date: r.date ?? undefined,
          excerpt: r.excerpt ?? undefined,
          content: r.contentMarkdown ?? undefined,
          tags: r.tagsJson ? JSON.parse(r.tagsJson) : undefined,
        }
      : null;
  }

  async createCategory(
    categoryData: Omit<Category, "slug"> & { slug: string },
  ): Promise<Category | null> {
    const db = await loadDb();
    const categories = await loadCategories();
    await db.insert(categories).values({
      slug: categoryData.slug,
      title: categoryData.title,
      date: categoryData.date,
      excerpt: categoryData.excerpt,
      contentMarkdown: categoryData.content,
      tagsJson: categoryData.tags ? JSON.stringify(categoryData.tags) : null,
    });
    return this.findBySlug(categoryData.slug);
  }
}
