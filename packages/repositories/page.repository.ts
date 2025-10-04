import { getContentDir } from "@/lib/content-path";
import type { Page, PageFilters, PageSortOptions } from "@/types/page";
import type { PageDataProvider } from "@/types/providers";
import { MdxPageProvider } from "./providers/mdx";

// types are imported from '@/types/page'

export class PageRepository {
  private static instance: PageRepository | null = null;
  private contentDir = getContentDir("pages");
  private readonly provider: PageDataProvider;

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
    this.provider = new MdxPageProvider();
  }

  public static getInstance(): PageRepository {
    if (!PageRepository.instance) {
      PageRepository.instance = new PageRepository();
    }
    return PageRepository.instance;
  }

  async findAll(): Promise<Page[]> {
    return this.provider.findAll();
  }

  async findWithFilters(
    filters: PageFilters = {},
    sortOptions: PageSortOptions = { field: "title", order: "asc" },
  ): Promise<Page[]> {
    return this.provider.findWithFilters(filters, sortOptions);
  }

  private applyFilters(pages: Page[], _filters: PageFilters): Page[] {
    return pages;
  }

  private applySorting(pages: Page[], _sortOptions: PageSortOptions): Page[] {
    return pages;
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.provider.findBySlug(slug);
  }

  async findAllTags(): Promise<string[]> {
    return this.provider.findAllTags();
  }

  async findByTag(tag: string): Promise<Page[]> {
    return this.provider.findByTag(tag);
  }

  async searchPages(query: string): Promise<Page[]> {
    return this.provider.searchPages(query);
  }

  async createPage(
    pageData: Omit<Page, "slug"> & { slug: string },
  ): Promise<Page | null> {
    return this.provider.createPage(pageData);
  }

  async updatePage(
    oldSlug: string,
    updates: Partial<Page>,
  ): Promise<Page | null> {
    return this.provider.updatePage(oldSlug, updates);
  }

  async deletePage(slug: string): Promise<boolean> {
    return this.provider.deletePage(slug);
  }
}
