export interface Page {
	slug: string;
	title: string;
	description?: string;
	date?: string;
	tags?: string[];
	excerpt?: string;
	content?: string;
	media?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string;
}

export interface PageFilters {
	tags?: string[];
	search?: string;
}

export interface PageSortOptions {
	field: 'date' | 'title' | 'created';
	order: 'asc' | 'desc';
}


