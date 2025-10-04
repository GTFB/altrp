import { getContentDir } from "@/lib/content-path";
import type { AuthorDataProvider } from "@/types/providers";
import type { Author } from "@/types/author";
import { MdxAuthorProvider } from "./providers/mdx";

// const authorSchema = z.object({
//   name: z.string(),
//   avatar: z.string().optional(),
//   bio: z.string().optional(),
// });

// type Author is imported from '@/types/author'

export class AuthorRepository {
  private static instance: AuthorRepository | null = null;
  private contentDir = getContentDir("authors");
  private readonly provider: AuthorDataProvider;

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
    this.provider = new MdxAuthorProvider();
  }

  public static getInstance(): AuthorRepository {
    if (!AuthorRepository.instance) {
      AuthorRepository.instance = new AuthorRepository();
    }
    return AuthorRepository.instance;
  }

  async findAll(): Promise<Author[]> {
    return this.provider.findAll();
  }

  async findBySlug(slug: string): Promise<Author | null> {
    return this.provider.findBySlug(slug);
  }

  async createAuthor(
    authorData: Omit<Author, "slug"> & { slug: string },
  ): Promise<Author | null> {
    return this.provider.createAuthor(authorData);
  }
}
