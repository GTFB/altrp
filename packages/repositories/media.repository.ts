import { getContentDir } from "@/lib/content-path";
import type { Media, MediaFilters, MediaSortOptions } from "@/types/media";
import type { MediaDataProvider } from "@/types/providers";
import { MdxMediaProvider } from "./providers/mdx";

// const mediaSchema = z.object({
//   title: z.string(),
//   description: z.string().optional(),
//   date: z.string().optional(),
//   tags: z.array(z.string()).optional(),
//   url: z.string(),
//   alt: z.string().optional(),
//   type: z.enum(['image', 'video', 'document', 'audio']).optional(),
//   size: z.number().optional(), // in bytes
//   width: z.number().optional(),
//   height: z.number().optional(),
//   duration: z.number().optional(), // for video/audio in seconds
// });

// types are imported from '@/types/media'

// types are imported from '@/types/media'

// types are imported from '@/types/media'

export class MediaRepository {
  private static instance: MediaRepository | null = null;
  private contentDir = getContentDir("media");
  private readonly provider: MediaDataProvider;

  private constructor() {
    // Markdown configuration is handled in packages/lib/markdown.ts
    this.provider = new MdxMediaProvider();
  }

  public static getInstance(): MediaRepository {
    if (!MediaRepository.instance) {
      MediaRepository.instance = new MediaRepository();
    }
    return MediaRepository.instance;
  }

  async findAll(): Promise<Media[]> {
    return this.provider.findAll();
  }

  async findWithFilters(
    filters: MediaFilters = {},
    sortOptions: MediaSortOptions = { field: "title", order: "asc" },
  ): Promise<Media[]> {
    return this.provider.findWithFilters(filters, sortOptions);
  }

  private applyFilters(mediaItems: Media[], _filters: MediaFilters): Media[] {
    return mediaItems;
  }

  private applySorting(
    mediaItems: Media[],
    _sortOptions: MediaSortOptions,
  ): Media[] {
    return mediaItems;
  }

  async findBySlug(slug: string): Promise<Media | null> {
    return this.provider.findBySlug(slug);
  }

  async findAllTypes(): Promise<string[]> {
    return this.provider.findAllTypes();
  }

  async findAllTags(): Promise<string[]> {
    return this.provider.findAllTags();
  }

  async findByType(
    type: "image" | "video" | "document" | "audio",
  ): Promise<Media[]> {
    return this.provider.findByType(type as NonNullable<Media["type"]>);
  }

  async findByTag(tag: string): Promise<Media[]> {
    return this.provider.findByTag(tag);
  }

  async searchMedia(query: string): Promise<Media[]> {
    return this.provider.searchMedia(query);
  }

  async createMedia(
    mediaData: Omit<Media, "slug"> & { slug: string },
  ): Promise<Media | null> {
    return this.provider.createMedia(mediaData);
  }

  async updateMedia(
    oldSlug: string,
    updates: Partial<Media>,
  ): Promise<Media | null> {
    return this.provider.updateMedia(oldSlug, updates);
  }

  async deleteMedia(slug: string): Promise<boolean> {
    return this.provider.deleteMedia(slug);
  }

  // Helper method to get media statistics
  async getMediaStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalSize: number;
    averageSize: number;
  }> {
    return this.provider.getMediaStats();
  }
}
