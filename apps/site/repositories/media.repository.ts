import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseMarkdown } from '../../../shared/lib/markdown';
import { z } from 'zod';
import { getContentDir } from '../../../shared/lib/content-path';

const mediaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  url: z.string(),
  alt: z.string().optional(),
  type: z.enum(['image', 'video', 'document', 'audio']).optional(),
  size: z.number().optional(), // in bytes
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(), // for video/audio in seconds
});

export interface Media {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
  alt?: string;
  type?: 'image' | 'video' | 'document' | 'audio';
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  content?: string;
}

export interface MediaFilters {
  type?: 'image' | 'video' | 'document' | 'audio';
  tags?: string[];
  search?: string;
  minSize?: number;
  maxSize?: number;
}

export interface MediaSortOptions {
  field: 'date' | 'title' | 'size' | 'created';
  order: 'asc' | 'desc';
}

export class MediaRepository {
  private static instance: MediaRepository | null = null;
  private contentDir = getContentDir('media');

  private constructor() {
    // Markdown configuration is handled in shared/lib/markdown.ts
  }

  public static getInstance(): MediaRepository {
    if (!MediaRepository.instance) {
      MediaRepository.instance = new MediaRepository();
    }
    return MediaRepository.instance;
  }

  async findAll(): Promise<Media[]> {
    return this.findWithFilters();
  }

  async findWithFilters(
    filters: MediaFilters = {},
    sortOptions: MediaSortOptions = { field: 'title', order: 'asc' }
  ): Promise<Media[]> {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const mediaItems: Media[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const slug = entry.name.replace('.mdx', '');
          console.log(slug)
          const mediaItem = await this.findBySlug(slug);
          if (mediaItem) {
            mediaItems.push(mediaItem);
          }
        }
      }

      // Apply filters
      let filteredMedia = this.applyFilters(mediaItems, filters);

      // Apply sorting
      return this.applySorting(filteredMedia, sortOptions);
    } catch (error) {
      console.error('Error reading media:', error);
      return [];
    }
  }

  private applyFilters(mediaItems: Media[], filters: MediaFilters): Media[] {
    return mediaItems.filter(media => {
      // Filter by type
      if (filters.type && media.type !== filters.type) {
        return false;
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = media.tags?.some(tag => 
          filters.tags!.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Filter by size
      if (filters.minSize && media.size && media.size < filters.minSize) {
        return false;
      }
      if (filters.maxSize && media.size && media.size > filters.maxSize) {
        return false;
      }

      // Text search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = media.title.toLowerCase().includes(searchLower);
        const matchesDescription = media.description?.toLowerCase().includes(searchLower) || false;
        const matchesAlt = media.alt?.toLowerCase().includes(searchLower) || false;
        const matchesTags = media.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ) || false;

        if (!matchesTitle && !matchesDescription && !matchesAlt && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(mediaItems: Media[], sortOptions: MediaSortOptions): Media[] {
    return mediaItems.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOptions.field) {
        case 'date':
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'created':
          // Use date as creation time
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (sortOptions.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  async findBySlug(slug: string): Promise<Media | null> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      const raw = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(raw);

      // Convert date to string if it's a Date object
      const processedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      const validatedData = mediaSchema.parse(processedData);
      
      // Parse Markdown content to HTML
      const parsedContent = await parseMarkdown(content);
      return {
        slug,
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        tags: validatedData.tags,
        url: validatedData.url,
        alt: validatedData.alt,
        type: validatedData.type,
        size: validatedData.size,
        width: validatedData.width,
        height: validatedData.height,
        duration: validatedData.duration,
        content: parsedContent,
      };
    } catch (error) {
      console.error(`Error reading media ${slug}:`, error);
      return null;
    }
  }

  async findAllTypes(): Promise<string[]> {
    try {
      const mediaItems = await this.findAll();
      const types = new Set<string>();
      
      mediaItems.forEach(media => {
        if (media.type) {
          types.add(media.type);
        }
      });
      
      return Array.from(types).sort();
    } catch (error) {
      console.error('Error reading media types:', error);
      return [];
    }
  }

  async findAllTags(): Promise<string[]> {
    try {
      const mediaItems = await this.findAll();
      const tags = new Set<string>();
      
      mediaItems.forEach(media => {
        if (media.tags) {
          media.tags.forEach(tag => tags.add(tag));
        }
      });
      
      return Array.from(tags).sort();
    } catch (error) {
      console.error('Error reading media tags:', error);
      return [];
    }
  }

  async findByType(type: 'image' | 'video' | 'document' | 'audio'): Promise<Media[]> {
    return this.findWithFilters({ type });
  }

  async findByTag(tag: string): Promise<Media[]> {
    return this.findWithFilters({ tags: [tag] });
  }

  async searchMedia(query: string): Promise<Media[]> {
    return this.findWithFilters({ search: query });
  }

  async createMedia(mediaData: Omit<Media, 'slug'> & { slug: string }): Promise<Media | null> {
    try {
      const { slug, ...frontmatterData } = mediaData;
      const filePath = path.join(this.contentDir, `${slug}.mdx`);

      // Check if media already exists
      try {
        await fs.access(filePath);
        throw new Error('Media with this slug already exists');
      } catch (error) {
        if (error instanceof Error && error.message !== 'Media with this slug already exists') {
          // File doesn't exist, which is good
        } else {
          throw error;
        }
      }

      // Prepare frontmatter
      const frontmatter = {
        title: frontmatterData.title,
        description: frontmatterData.description,
        date: frontmatterData.date || new Date().toISOString().split('T')[0],
        tags: frontmatterData.tags || [],
        url: frontmatterData.url,
        alt: frontmatterData.alt,
        type: frontmatterData.type,
        size: frontmatterData.size,
        width: frontmatterData.width,
        height: frontmatterData.height,
        duration: frontmatterData.duration,
      };

      // Validate frontmatter
      const validatedFrontmatter = mediaSchema.parse(frontmatter);

      // Prepare content
      const mdxContent = `---\n${Object.entries(validatedFrontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
          }
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        })
        .join('\n')}\n---\n\n${frontmatterData.content || ''}`;

      // Write the media file
      await fs.writeFile(filePath, mdxContent, 'utf8');

      return this.findBySlug(slug);
    } catch (error) {
      console.error('Error creating media:', error);
      return null;
    }
  }

  async updateMedia(oldSlug: string, updates: Partial<Media>): Promise<Media | null> {
    try {
      const existingMedia = await this.findBySlug(oldSlug);
      if (!existingMedia) {
        throw new Error('Media not found');
      }

      const updatedMedia = { ...existingMedia, ...updates };
      const newSlug = updates.slug || oldSlug;
      const oldFilePath = path.join(this.contentDir, `${oldSlug}.mdx`);
      const newFilePath = path.join(this.contentDir, `${newSlug}.mdx`);

      // Prepare frontmatter
      const frontmatter = {
        title: updatedMedia.title,
        description: updatedMedia.description,
        date: updatedMedia.date,
        tags: updatedMedia.tags || [],
        url: updatedMedia.url,
        alt: updatedMedia.alt,
        type: updatedMedia.type,
        size: updatedMedia.size,
        width: updatedMedia.width,
        height: updatedMedia.height,
        duration: updatedMedia.duration,
      };

      // Validate frontmatter
      const validatedFrontmatter = mediaSchema.parse(frontmatter);

      // Prepare content
      const mdxContent = `---\n${Object.entries(validatedFrontmatter)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
          }
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        })
        .join('\n')}\n---\n\n${updatedMedia.content || ''}`;

      // If slug changed, rename the file
      if (newSlug !== oldSlug) {
        // Write the new file with new slug
        await fs.writeFile(newFilePath, mdxContent, 'utf8');
        // Delete the old file
        await fs.unlink(oldFilePath);
      } else {
        // Just update the existing file
        await fs.writeFile(oldFilePath, mdxContent, 'utf8');
      }

      return this.findBySlug(newSlug);
    } catch (error) {
      console.error('Error updating media:', error);
      return null;
    }
  }

  async deleteMedia(slug: string): Promise<boolean> {
    try {
      const filePath = path.join(this.contentDir, `${slug}.mdx`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  }

  // Helper method to get media statistics
  async getMediaStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalSize: number;
    averageSize: number;
  }> {
    try {
      const mediaItems = await this.findAll();
      const stats = {
        total: mediaItems.length,
        byType: {} as Record<string, number>,
        totalSize: 0,
        averageSize: 0,
      };

      mediaItems.forEach(media => {
        // Count by type
        const type = media.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // Calculate size
        if (media.size) {
          stats.totalSize += media.size;
        }
      });

      stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating media stats:', error);
      return {
        total: 0,
        byType: {},
        totalSize: 0,
        averageSize: 0,
      };
    }
  }
}
