import { getContentDir } from "@/lib/content-path";
import type { Category } from "@/packages/types/category";
import type { CategoryDataProvider } from "@/packages/types/providers";
import { createCategoryProvider } from "@/repositories/providers/factory";

// const categorySchema = z.object({
//   title: z.string(),
//   date: z.string().optional(),
//   tags: z.array(z.string()).optional(),
//   excerpt: z.string().optional(),
// });

export class CategoryRepository {
  private static instance: CategoryRepository | null = null;
  private contentDir = getContentDir("categories");
  private readonly provider: CategoryDataProvider;

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
    this.provider = createCategoryProvider();
  }

  public static getInstance(): CategoryRepository {
    if (!CategoryRepository.instance) {
      CategoryRepository.instance = new CategoryRepository();
    }
    return CategoryRepository.instance;
  }

  async findAll(): Promise<Category[]> {
    return this.provider.findAll();
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.provider.findBySlug(slug);
  }

  async createCategory(
    categoryData: Omit<Category, "slug"> & { slug: string },
  ): Promise<Category | null> {
    return this.provider.createCategory(categoryData);
  }
}
