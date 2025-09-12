import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
}

export interface UseBlogPostsOptions {
  limit?: number;
  tags?: string[];
  search?: string;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface UseBlogPostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useBlogPosts(options: UseBlogPostsOptions = {}): UseBlogPostsReturn {
  const {
    limit = 10,
    tags = [],
    search = '',
    sortBy = 'date',
    sortOrder = 'desc'
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isInitialLoad = useRef(true);

  // Memoize search parameters for stability
  const searchParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(tags.length > 0 && { tags: tags.join(',') }),
      ...(search && { search })
    });
    return params.toString();
  }, [limit, sortBy, sortOrder, tags, search]);

  // Load posts via API
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/posts?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setAllPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading posts');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Load additional posts
  const loadMore = useCallback(async () => {
    if (loading) return;
    
    const nextPage = currentPage + 1;
    const newLimit = nextPage * limit;
    
    try {
      setLoading(true);
      
      const newSearchParams = new URLSearchParams({
        limit: newLimit.toString(),
        sortBy,
        sortOrder,
        ...(tags.length > 0 && { tags: tags.join(',') }),
        ...(search && { search })
      });

      const response = await fetch(`/api/posts?${newSearchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading posts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, sortBy, sortOrder, tags, search, loading]);

  // Update data
  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await loadPosts();
  }, [loadPosts]);

  // Effect for loading posts on mount
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadPosts();
    }
  }, [loadPosts]);

  const hasMore = useMemo(() => {
    return allPosts.length >= limit;
  }, [allPosts.length, limit]);

  return {
    posts,
    loading,
    error,
    refetch,
    hasMore,
    loadMore
  };
}

// Hook for getting a single post by slug
export function useBlogPost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/posts/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setPost(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading post');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return {
    post,
    loading,
    error,
    refetch: loadPost
  };
}
