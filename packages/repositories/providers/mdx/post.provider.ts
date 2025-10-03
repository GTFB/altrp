import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Fuse from 'fuse.js';
import { parseMarkdown } from '@/lib/markdown';
import { frontmatterSchema } from '@/lib/validators/content.schema';
import { getContentDir } from '@/lib/content-path';
import type { PostDataProvider } from '../types';
import type { Post, PostFilters, PostSortOptions, PaginationOptions, PaginatedResult } from '@/types/post';
import { i18nConfig } from '../../../../apps/cms/src/config/i18n';

export class MdxPostProvider implements PostDataProvider {
	private readonly contentDir = getContentDir('blog');

	async findAll(): Promise<Post[]> {
		return this.findWithFilters();
	}

	private applyFilters(posts: Post[], filters: PostFilters = {}): Post[] {
		return posts.filter(post => {
			if (filters.category && post.category !== filters.category) return false;
			if (filters.tags && filters.tags.length > 0) {
				const hasMatchingTag = post.tags?.some(tag => filters.tags!.includes(tag));
				if (!hasMatchingTag) return false;
			}
			if (filters.author && post.author !== filters.author) return false;
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				const matchesTitle = post.title.toLowerCase().includes(searchLower);
				const matchesDescription = post.description?.toLowerCase().includes(searchLower) || false;
				const matchesExcerpt = post.excerpt?.toLowerCase().includes(searchLower) || false;
				const matchesTags = post.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false;
				if (!matchesTitle && !matchesDescription && !matchesExcerpt && !matchesTags) return false;
			}
			return true;
		});
	}

	private applySorting(posts: Post[], sortOptions: PostSortOptions = { field: 'date', order: 'desc' }): Post[] {
		return posts.sort((a, b) => {
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
		filters: PostFilters = {},
		sortOptions: PostSortOptions = { field: 'date', order: 'desc' }
	): Promise<Post[]> {
		const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
		const posts: Post[] = [];
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const slug = entry.name;
				const post = await this.findBySlug(slug, i18nConfig.defaultLocale);
				if (post) posts.push(post);
			}
		}
		const filtered = this.applyFilters(posts, filters);
		return this.applySorting(filtered, sortOptions);
	}

	async findWithPagination(
		filters: PostFilters = {},
		sortOptions: PostSortOptions = { field: 'date', order: 'desc' },
		paginationOptions: PaginationOptions = { page: 1, limit: 10 }
	): Promise<PaginatedResult<Post>> {
		const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
		const posts: Post[] = [];
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const slug = entry.name;
				const post = await this.findBySlug(slug, i18nConfig.defaultLocale);
				if (post) posts.push(post);
			}
		}
		const filtered = this.applyFilters(posts, filters);
		const sorted = this.applySorting(filtered, sortOptions);
		const total = sorted.length;
		const totalPages = Math.ceil(total / paginationOptions.limit);
		const startIndex = (paginationOptions.page - 1) * paginationOptions.limit;
		const endIndex = startIndex + paginationOptions.limit;
		const paginatedData = sorted.slice(startIndex, endIndex);
		return {
			data: paginatedData,
			pagination: {
				page: paginationOptions.page,
				limit: paginationOptions.limit,
				total,
				totalPages,
				hasNext: paginationOptions.page < totalPages,
				hasPrev: paginationOptions.page > 1,
			},
		};
	}

	async findBySlug(slug: string, locale: string = i18nConfig.defaultLocale): Promise<Post | null> {
		try {
			let fileName = 'index.mdx';
			if (locale !== i18nConfig.defaultLocale) {
				fileName = `${locale}.mdx`;
				const localeFilePath = path.join(this.contentDir, slug, fileName);
				try { await fs.access(localeFilePath); } catch { fileName = 'index.mdx'; }
			}
			const filePath = path.join(this.contentDir, slug, fileName);
			const raw = await fs.readFile(filePath, 'utf8');
			const { data, content } = matter(raw);
			const processed = { ...data, date: data.date instanceof Date ? data.date.toISOString() : data.date };
			const validated = frontmatterSchema.parse(processed);
			const parsedContent = await parseMarkdown(content);
			return {
				slug,
				title: validated.title,
				description: validated.description,
				date: validated.date,
				tags: validated.tags,
				excerpt: validated.excerpt || '',
				content: parsedContent,
				category: (data as any).category,
				author: (data as any).author,
			};
		} catch (error) {
			console.error(`Error reading post ${slug}:`, error);
			return null;
		}
	}

	async findAllCategories(): Promise<string[]> {
		const posts = await this.findAll();
		const categories = new Set<string>();
		posts.forEach(p => { if (p.category) categories.add(p.category); });
		return Array.from(categories).sort();
	}

	async findAllAuthors(): Promise<string[]> {
		const posts = await this.findAll();
		const authors = new Set<string>();
		posts.forEach(p => { if (p.author) authors.add(p.author); });
		return Array.from(authors).sort();
	}

	async findByCategory(category: string): Promise<Post[]> {
		return this.findWithFilters({ category });
	}

	async findByAuthor(author: string): Promise<Post[]> {
		return this.findWithFilters({ author });
	}

	async findByTag(tag: string): Promise<Post[]> {
		return this.findWithFilters({ tags: [tag] });
	}

	async findAllTags(): Promise<Array<{ tag: string; count: number }>> {
		const posts = await this.findAll();
		const tagCounts = new Map<string, number>();
		posts.forEach(post => post.tags?.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
		return Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
	}

	async search(query: string, options = {}): Promise<import('../../base.repository').SearchResult<Post>[]> {
		const posts = await this.findAll();
		if (!query.trim()) return posts.map(post => ({ item: post, score: 1 }));
		const fuse = new Fuse(posts, {
			includeScore: true,
			includeMatches: true,
			threshold: (options as any).threshold || 0.35,
			keys: [
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.3 },
				{ name: 'excerpt', weight: 0.2 },
				{ name: 'tags', weight: 0.1 },
			],
		});
		const results = fuse.search(query, { limit: (options as any).limit || 10 });
		return results.map(r => ({ item: r.item, score: r.score, matches: r.matches?.map(m => m.value || '') || [] }));
	}

	async createPost(postData: Omit<Post, 'slug'> & { slug: string }): Promise<Post | null> {
		try {
			const { slug, ...frontmatterData } = postData;
			const filePath = path.join(this.contentDir, slug, 'index.mdx');
			try {
				await fs.access(filePath);
				throw new Error('Post with this slug already exists');
			} catch (error) {
				if (error instanceof Error && error.message !== 'Post with this slug already exists') {
					// ok
				} else {
					throw error;
				}
			}
			const frontmatter = frontmatterSchema.parse({
				title: frontmatterData.title,
				description: frontmatterData.description,
				date: frontmatterData.date || new Date().toISOString().split('T')[0],
				tags: frontmatterData.tags || [],
				excerpt: frontmatterData.excerpt,
				category: frontmatterData.category,
				author: frontmatterData.author,
				media: frontmatterData.media,
				seoTitle: frontmatterData.seoTitle,
				seoDescription: frontmatterData.seoDescription,
				seoKeywords: frontmatterData.seoKeywords,
			});
			const mdxContent = `---\n${Object.entries(frontmatter)
				.filter(([_, value]) => value !== undefined && value !== null)
				.map(([key, value]) => {
					if (Array.isArray(value)) return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
					return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
				})
				.join('\n')}\n---\n\n${frontmatterData.content || ''}`;
			await fs.mkdir(path.dirname(filePath), { recursive: true });
			await fs.writeFile(filePath, mdxContent, 'utf8');
			return this.findBySlug(slug);
		} catch (error) {
			console.error('Error creating post:', error);
			return null;
		}
	}
}


