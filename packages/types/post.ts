export interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
  category?: string;
  author?: string;
  media?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface PostFilters {
  category?: string;
  tags?: string[];
  author?: string;
  search?: string;
}

export interface PostSortOptions {
  field: "date" | "title" | "created";
  order: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
