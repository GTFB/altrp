import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { parseMarkdown } from "@/lib/markdown";
import { z } from "zod";
import { getContentDir } from "@/lib/content-path";
import type { AuthorDataProvider } from "@/types/providers";
import type { Author } from "@/types/author";

const authorSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

export class MdxAuthorProvider implements AuthorDataProvider {
  private readonly contentDir = getContentDir("authors");

  async findAll(): Promise<Author[]> {
    const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
    const authors: Author[] = [];
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const slug = entry.name.replace(".mdx", "");
        const author = await this.findBySlug(slug);
        if (author) authors.push(author);
      }
    }
    return authors.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findBySlug(slug: string): Promise<Author | null> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      const validated = authorSchema.parse(data);
      const parsedContent = await parseMarkdown(content);
      return {
        slug,
        name: validated.name,
        avatar: validated.avatar,
        bio: validated.bio,
        content: parsedContent,
      };
    } catch (error) {
      console.error(`Error reading author ${slug}:`, error);
      return null;
    }
  }

  async createAuthor(
    authorData: Omit<Author, "slug"> & { slug: string },
  ): Promise<Author | null> {
    try {
      const { slug, ...frontmatterData } = authorData;
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      try {
        await fs.access(filePath);
        throw new Error("Author with this slug already exists");
      } catch (error) {
        if (
          error instanceof Error &&
          error.message !== "Author with this slug already exists"
        ) {
          // ok, file doesn't exist
        } else {
          throw error;
        }
      }
      const frontmatter = authorSchema.parse({
        name: frontmatterData.name,
        avatar: frontmatterData.avatar,
        bio: frontmatterData.bio,
      });
      const mdxContent = `---\n${Object.entries(frontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(
          ([key, value]) =>
            `${key}: ${typeof value === "string" ? `"${value}"` : value}`,
        )
        .join("\n")}\n---\n\n${frontmatterData.content || ""}`;
      await fs.writeFile(filePath, mdxContent, "utf8");
      return this.findBySlug(slug);
    } catch (error) {
      console.error("Error creating author:", error);
      return null;
    }
  }
}
