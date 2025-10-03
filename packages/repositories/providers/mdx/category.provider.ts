import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseMarkdown } from '@/lib/markdown';
import { z } from 'zod';
import { getContentDir } from '@/lib/content-path';
import type { CategoryDataProvider } from '../types';
import type { Category } from '@/types/category';

const categorySchema = z.object({
	title: z.string(),
	date: z.string().optional(),
	tags: z.array(z.string()).optional(),
	excerpt: z.string().optional(),
});

export class MdxCategoryProvider implements CategoryDataProvider {
	private readonly contentDir = getContentDir('categories');

	async findAll(): Promise<Category[]> {
		const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
		const categories: Category[] = [];
		for (const entry of entries) {
			if (entry.isFile() && entry.name.endsWith('.mdx')) {
				const slug = entry.name.replace('.mdx', '');
				const category = await this.findBySlug(slug);
				if (category) categories.push(category);
			}
		}
		return categories.sort((a, b) => a.title.localeCompare(b.title));
	}

	async findBySlug(slug: string): Promise<Category | null> {
		try {
			const filePath = path.join(this.contentDir, `${slug}.mdx`);
			const raw = await fs.readFile(filePath, 'utf8');
			const { data, content } = matter(raw);
			const processed = { ...data, date: data.date instanceof Date ? data.date.toISOString() : data.date };
			const validated = categorySchema.parse(processed);
			const parsedContent = await parseMarkdown(content);
			return {
				slug,
				title: validated.title,
				date: validated.date,
				tags: validated.tags,
				excerpt: validated.excerpt,
				content: parsedContent,
			};
		} catch (error) {
			console.error(`Error reading category ${slug}:`, error);
			return null;
		}
	}

	async createCategory(categoryData: Omit<Category, 'slug'> & { slug: string }): Promise<Category | null> {
		try {
			const { slug, ...frontmatterData } = categoryData;
			const filePath = path.join(this.contentDir, `${slug}.mdx`);
			try {
				await fs.access(filePath);
				throw new Error('Category with this slug already exists');
			} catch (error) {
				if (error instanceof Error && error.message !== 'Category with this slug already exists') {
					// ok
				} else {
					throw error;
				}
			}
			const frontmatter = categorySchema.parse({
				title: frontmatterData.title,
				date: frontmatterData.date || new Date().toISOString().split('T')[0],
				tags: frontmatterData.tags || [],
				excerpt: frontmatterData.excerpt,
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
			console.error('Error creating category:', error);
			return null;
		}
	}
}


