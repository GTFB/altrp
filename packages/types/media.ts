export type MediaType = "image" | "video" | "document" | "audio";

export interface Media {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
  alt?: string;
  type?: MediaType;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  content?: string;
}

export interface MediaFilters {
  type?: MediaType;
  tags?: string[];
  search?: string;
  minSize?: number;
  maxSize?: number;
}

export interface MediaSortOptions {
  field: "date" | "title" | "size" | "created";
  order: "asc" | "desc";
}
