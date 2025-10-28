import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { parseMarkdown } from "@/lib/markdown";
import { frontmatterSchema } from "@/lib/validators/content.schema";
import { getContentDir } from "@/lib/content-path";
import type { PageDataProvider } from "@/packages/types/providers";
import type { Page, PageFilters, PageSortOptions } from "@/packages/types/page";

export class MdxPageProvider implements PageDataProvider {
  private readonly contentDir = getContentDir("pages");

  async findAll(): Promise<Page[]> {
    return this.findWithFilters();
  }

  private applyFilters(pages: Page[], filters: PageFilters = {}): Page[] {
    return pages.filter((page) => {
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = page.tags?.some((tag) =>
          filters.tags!.includes(tag),
        );
        if (!hasMatchingTag) return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = page.title.toLowerCase().includes(searchLower);
        const matchesDescription =
          page.description?.toLowerCase().includes(searchLower) || false;
        const matchesExcerpt =
          page.excerpt?.toLowerCase().includes(searchLower) || false;
        const matchesTags =
          page.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          false;
        if (
          !matchesTitle &&
          !matchesDescription &&
          !matchesExcerpt &&
          !matchesTags
        )
          return false;
      }
      return true;
    });
  }

  private applySorting(
    pages: Page[],
    sortOptions: PageSortOptions = { field: "title", order: "asc" },
  ): Page[] {
    return pages.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      switch (sortOptions.field) {
        case "date":
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created":
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        default:
          return 0;
      }
      if (sortOptions.order === "asc") return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }

  async findWithFilters(
    filters: PageFilters = {},
    sortOptions: PageSortOptions = { field: "title", order: "asc" },
  ): Promise<Page[]> {
    const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
    const pages: Page[] = [];
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const slug = entry.name.replace(".mdx", "");
        const page = await this.findBySlug(slug);
        if (page) pages.push(page);
      }
    }
    const filtered = this.applyFilters(pages, filters);
    return this.applySorting(filtered, sortOptions);
  }

  async findBySlug(slug: string): Promise<Page | null> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      const processed = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      const validated = frontmatterSchema.parse(processed);
      const parsedContent = await parseMarkdown(content);
      return {
        slug,
        title: validated.title,
        description: validated.description,
        date: validated.date,
        tags: validated.tags,
        excerpt: validated.excerpt || "",
        content: parsedContent,
        media: validated.media,
      };
    } catch (error) {
      //console.error(`Error reading page ${slug}:`, error);
      return null;
    }
  }

  async findAllTags(): Promise<string[]> {
    const pages = await this.findAll();
    const tags = new Set<string>();
    pages.forEach((p) => p.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }

  async findByTag(tag: string): Promise<Page[]> {
    return this.findWithFilters({ tags: [tag] });
  }

  async searchPages(query: string): Promise<Page[]> {
    return this.findWithFilters({ search: query });
  }

  async createPage(
    pageData: Omit<Page, "slug"> & { slug: string },
  ): Promise<Page | null> {
    try {
      const { slug, ...frontmatterData } = pageData;
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      try {
        await fs.access(filePath);
        throw new Error("Page with this slug already exists");
      } catch (error) {
        if (
          error instanceof Error &&
          error.message !== "Page with this slug already exists"
        ) {
          // ok
        } else {
          throw error;
        }
      }
      const frontmatter = frontmatterSchema.parse({
        title: frontmatterData.title,
        description: frontmatterData.description,
        date: frontmatterData.date || new Date().toISOString().split("T")[0],
        tags: frontmatterData.tags || [],
        excerpt: frontmatterData.excerpt,
        media: frontmatterData.media,
      });
      const mdxContent = `---\n${Object.entries(frontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value))
            return `${key}: [${value.map((v) => `"${v}"`).join(", ")}]`;
          return `${key}: ${typeof value === "string" ? `"${value}"` : value}`;
        })
        .join("\n")}\n---\n\n${frontmatterData.content || ""}`;
      await fs.writeFile(filePath, mdxContent, "utf8");
      return this.findBySlug(slug);
    } catch (error) {
      console.error("Error creating page:", error);
      return null;
    }
  }

  async updatePage(
    oldSlug: string,
    updates: Partial<Page>,
  ): Promise<Page | null> {
    try {
      const existing = await this.findBySlug(oldSlug);
      if (!existing) throw new Error("Page not found");
      const updated = { ...existing, ...updates } as Page;
      const newSlug = (updates as any).slug || oldSlug;
      const oldFilePath = path.join(this.contentDir, `${oldSlug}.mdx`);
      const newFilePath = path.join(this.contentDir, `${newSlug}.mdx`);
      const frontmatter = {
        title: updated.title,
        description: updated.description,
        date: updated.date,
        tags: updated.tags || [],
        excerpt: updated.excerpt,
        media: updated.media,
      };
      const mdxContent = `---\n${Object.entries(frontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value))
            return `${key}: [${value.map((v) => `"${v}"`).join(", ")}]`;
          return `${key}: ${typeof value === "string" ? `"${value}"` : value}`;
        })
        .join("\n")}\n---\n\n${updated.content || ""}`;
      if (newSlug !== oldSlug) {
        await fs.writeFile(newFilePath, mdxContent, "utf8");
        await fs.unlink(oldFilePath);
      } else {
        await fs.writeFile(oldFilePath, mdxContent, "utf8");
      }
      return this.findBySlug(newSlug);
    } catch (error) {
      console.error("Error updating page:", error);
      return null;
    }
  }

  async deletePage(slug: string): Promise<boolean> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting page:", error);
      return false;
    }
  }
}
