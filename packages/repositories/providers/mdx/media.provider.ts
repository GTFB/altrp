import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseMarkdown } from '@/lib/markdown';
import { z } from 'zod';
import { getContentDir } from '@/lib/content-path';
import type { MediaDataProvider } from '../types';
import type { Media, MediaFilters, MediaSortOptions } from '@/types/media';

const mediaSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	date: z.string().optional(),
	tags: z.array(z.string()).optional(),
	url: z.string(),
	alt: z.string().optional(),
	type: z.enum(['image', 'video', 'document', 'audio']).optional(),
	size: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	duration: z.number().optional(),
});

export class MdxMediaProvider implements MediaDataProvider {
	private readonly contentDir = getContentDir('media');

	async findAll(): Promise<Media[]> {
		return this.findWithFilters();
	}

	private applyFilters(mediaItems: Media[], filters: MediaFilters = {}): Media[] {
		return mediaItems.filter(media => {
			if (filters.type && media.type !== filters.type) return false;
			if (filters.tags && filters.tags.length > 0) {
				const hasMatchingTag = media.tags?.some(tag => filters.tags!.includes(tag));
				if (!hasMatchingTag) return false;
			}
			if (filters.minSize && media.size && media.size < filters.minSize) return false;
			if (filters.maxSize && media.size && media.size > filters.maxSize) return false;
			if (filters.search) {
				const s = filters.search.toLowerCase();
				const t = media.title.toLowerCase().includes(s);
				const d = media.description?.toLowerCase().includes(s) || false;
				const a = media.alt?.toLowerCase().includes(s) || false;
				const g = media.tags?.some(tag => tag.toLowerCase().includes(s)) || false;
				if (!t && !d && !a && !g) return false;
			}
			return true;
		});
	}

	private applySorting(mediaItems: Media[], sortOptions: MediaSortOptions = { field: 'title', order: 'asc' }): Media[] {
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
					aValue = a.date ? new Date(a.date).getTime() : 0;
					bValue = b.date ? new Date(b.date).getTime() : 0;
					break;
				default:
					return 0;
			}
			if (sortOptions.order === 'asc') return aValue > bValue ? 1 : -1;
			return aValue < bValue ? 1 : -1;
		});
	}

	async findWithFilters(
		filters: MediaFilters = {},
		sortOptions: MediaSortOptions = { field: 'title', order: 'asc' }
	): Promise<Media[]> {
		const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
		const mediaItems: Media[] = [];
		for (const entry of entries) {
			if (entry.isFile() && entry.name.endsWith('.mdx')) {
				const slug = entry.name.replace('.mdx', '');
				const item = await this.findBySlug(slug);
				if (item) mediaItems.push(item);
			}
		}
		const filtered = this.applyFilters(mediaItems, filters);
		return this.applySorting(filtered, sortOptions);
	}

	async findBySlug(slug: string): Promise<Media | null> {
		try {
			const filePath = path.join(this.contentDir, `${slug}.mdx`);
			const raw = await fs.readFile(filePath, 'utf8');
			const { data, content } = matter(raw);
			const processed = { ...data, date: data.date instanceof Date ? data.date.toISOString() : data.date };
			const validated = mediaSchema.parse(processed);
			const parsedContent = await parseMarkdown(content);
			return {
				slug,
				title: validated.title,
				description: validated.description,
				date: validated.date,
				tags: validated.tags,
				url: validated.url,
				alt: validated.alt,
				type: validated.type,
				size: validated.size,
				width: validated.width,
				height: validated.height,
				duration: validated.duration,
				content: parsedContent,
			};
		} catch (error) {
			console.error(`Error reading media ${slug}:`, error);
			return null;
		}
	}

	async findAllTypes(): Promise<string[]> {
		const items = await this.findAll();
		const types = new Set<string>();
		items.forEach(m => { if (m.type) types.add(m.type); });
		return Array.from(types).sort();
	}

	async findAllTags(): Promise<string[]> {
		const items = await this.findAll();
		const tags = new Set<string>();
		items.forEach(m => m.tags?.forEach(tag => tags.add(tag)));
		return Array.from(tags).sort();
	}

	async findByType(type: NonNullable<Media['type']>): Promise<Media[]> {
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
			try {
				await fs.access(filePath);
				throw new Error('Media with this slug already exists');
			} catch (error) {
				if (error instanceof Error && error.message !== 'Media with this slug already exists') {
					// ok
				} else {
					throw error;
				}
			}
			const frontmatter = mediaSchema.parse({
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
			});
			const mdxContent = `---\n${Object.entries(frontmatter)
				.filter(([_, value]) => value !== undefined && value !== null)
				.map(([key, value]) => {
					if (Array.isArray(value)) return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
					return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
				})
				.join('\n')}\n---\n\n${frontmatterData.content || ''}`;
			await fs.writeFile(filePath, mdxContent, 'utf8');
			return this.findBySlug(slug);
		} catch (error) {
			console.error('Error creating media:', error);
			return null;
		}
	}

	async updateMedia(oldSlug: string, updates: Partial<Media>): Promise<Media | null> {
		try {
			const existing = await this.findBySlug(oldSlug);
			if (!existing) throw new Error('Media not found');
			const updated = { ...existing, ...updates } as Media;
			const newSlug = (updates as any).slug || oldSlug;
			const oldFilePath = path.join(this.contentDir, `${oldSlug}.mdx`);
			const newFilePath = path.join(this.contentDir, `${newSlug}.mdx`);
			const frontmatter = {
				title: updated.title,
				description: updated.description,
				date: updated.date,
				tags: updated.tags || [],
				url: updated.url,
				alt: updated.alt,
				type: updated.type,
				size: updated.size,
				width: updated.width,
				height: updated.height,
				duration: updated.duration,
			};
			const mdxContent = `---\n${Object.entries(frontmatter)
				.filter(([_, value]) => value !== undefined && value !== null)
				.map(([key, value]) => {
					if (Array.isArray(value)) return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
					return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
				})
				.join('\n')}\n---\n\n${updated.content || ''}`;
			if (newSlug !== oldSlug) {
				await fs.writeFile(newFilePath, mdxContent, 'utf8');
				await fs.unlink(oldFilePath);
			} else {
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

	async getMediaStats(): Promise<{ total: number; byType: Record<string, number>; totalSize: number; averageSize: number; }> {
		const mediaItems = await this.findAll();
		const stats = {
			total: mediaItems.length,
			byType: {} as Record<string, number>,
			totalSize: 0,
			averageSize: 0,
		};
		mediaItems.forEach(media => {
			const type = media.type || 'unknown';
			stats.byType[type] = (stats.byType[type] || 0) + 1;
			if (media.size) stats.totalSize += media.size;
		});
		stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;
		return stats;
	}
}


