import { useState, useEffect } from "react";

export interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
}

export interface UseBlogPostsSimpleOptions {
  limit?: number;
  category?: string;
  author?: string;
  tags?: string[];
  search?: string;
  sortBy?: "date" | "title" | "created";
  sortOrder?: "asc" | "desc";
}

export interface UseBlogPostsSimpleReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBlogPostsSimple(
  options: UseBlogPostsSimpleOptions = {},
): UseBlogPostsSimpleReturn {
  const {
    limit = 6,
    category,
    author,
    tags,
    search,
    sortBy = "date",
    sortOrder = "desc",
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(category && { category }),
        ...(author && { author }),
        ...(tags && tags.length > 0 && { tags: tags.join(",") }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/posts?${searchParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []); // Empty dependency array - load only once

  return {
    posts,
    loading,
    error,
    refetch: loadPosts,
  };
}
