import type { AuthorDataProvider } from "@/types/providers";
import type { Author } from "@/types/author";
import { db } from "../../../../apps/cms/src/db/client";
import { authors } from "../../../../apps/cms/src/db/schema";
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
}
