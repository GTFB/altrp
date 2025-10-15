import type { AuthorDataProvider } from "@/types/providers";
import type { Author } from "@/types/author";
import { db } from "@/packages/db/cms/client";
import { authors } from "@/packages/db/cms/schema";
import { eq } from "drizzle-orm";

export class SqliteAuthorProvider implements AuthorDataProvider {
  async findAll(): Promise<Author[]> {
    const rows = await db.select().from(authors);
    return rows.map((r) => ({
      slug: r.slug!,
      name: r.name!,
      avatar: r.avatar ?? undefined,
      bio: r.bio ?? undefined,
      content: r.contentMarkdown ?? undefined,
    }));
  }

  async findBySlug(slug: string): Promise<Author | null> {
    const rows = await db
      .select()
      .from(authors)
      .where(eq(authors.slug, slug))
      .limit(1);
    const r = rows[0];
    return r
      ? {
          slug: r.slug!,
          name: r.name!,
          avatar: r.avatar ?? undefined,
          bio: r.bio ?? undefined,
          content: r.contentMarkdown ?? undefined,
        }
      : null;
  }

  async createAuthor(
    authorData: Omit<Author, "slug"> & { slug: string },
  ): Promise<Author | null> {
    await db.insert(authors).values({
      slug: authorData.slug,
      name: authorData.name,
      avatar: authorData.avatar,
      bio: authorData.bio,
      contentMarkdown: authorData.content,
    });
    return this.findBySlug(authorData.slug);
  }

  async deleteAuthor(slug: string): Promise<boolean> {
    const res = await db.delete(authors).where(eq(authors.slug, slug));
    // drizzle better-sqlite3 returns info via changes on run; treat success if no error
    return true;
  }

  async updateAuthor(
    oldSlug: string,
    updates: Partial<Author> & { newSlug?: string },
  ): Promise<Author | null> {
    const values: any = {};
    if (updates.name !== undefined) values.name = updates.name;
    if (updates.avatar !== undefined) values.avatar = updates.avatar;
    if (updates.bio !== undefined) values.bio = updates.bio;
    if (updates.content !== undefined) values.contentMarkdown = updates.content;
    if (updates.newSlug !== undefined) values.slug = updates.newSlug;
    if (Object.keys(values).length === 0) return this.findBySlug(oldSlug);
    await db.update(authors).set(values).where(eq(authors.slug, oldSlug));
    const finalSlug = updates.newSlug || oldSlug;
    return this.findBySlug(finalSlug);
  }
}
