'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';
import { CategoryFilter } from '@/components/blocks-app/CategoryFilter';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  category?: string;
  author?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [editingCell, setEditingCell] = useState<{ postSlug: string; field: 'title' | 'slug' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  const [hoveredRowSlug, setHoveredRowSlug] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Watch for search params changes and refetch posts
  useEffect(() => {
    fetchPosts(1); // Reset to page 1 when filters change
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const fetchPosts = async (page: number = pagination.page) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      // Add category filter if present
      const category = searchParams.get('category');
      if (category) {
        params.set('category', category);
      }
      
      const response = await fetch(`/api/admin/blog?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setPagination(data.pagination);
        setError(null);
        
        // Show success icon for 0.5 seconds
        setLoading(false);
        setShowSuccessIcon(true);
        setTimeout(() => {
          setShowSuccessIcon(false);
        }, 500);
      } else {
        setError(data.error || 'Failed to fetch posts');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
      setLoading(false);
    }
  };

  const handleMouseEnter = (postSlug: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredRowSlug(postSlug);
    }, 300); // 300ms delay
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredRowSlug(null);
  };

  const handleDeletePost = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/blog/${slug}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Success!', 'Post deleted successfully');
        // Refresh the posts list
        await fetchPosts();
      } else {
        showError('Error', data.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      showError('Error', 'Failed to delete post');
    }
  };

  const handleDoubleClick = (postSlug: string, field: 'title' | 'slug', currentValue: string) => {
    setEditingCell({ postSlug, field });
    setEditValue(currentValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    try {
      const response = await fetch(`/api/admin/blog/${editingCell.postSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [editingCell.field]: editValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success!', 'Post updated successfully');
        
        // If slug was changed, refresh the entire list to get updated data
        if (editingCell.field === 'slug' && editValue !== editingCell.postSlug) {
          await fetchPosts();
        } else {
          // Update local state for other fields
          setPosts(prev => prev.map(post => 
            post.slug === editingCell.postSlug 
              ? { ...post, [editingCell.field]: editValue }
              : post
          ));
        }
        
        setEditingCell(null);
        setEditValue('');
      } else {
        showError('Error', data.error || 'Failed to update post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      showError('Error', 'Failed to update post');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPosts(newPage);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    
    // Always show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) {
        pages.push('...');
      }
    }
    
    // Show pages around current page
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Manage blog posts
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/posts/new">
            <Plus className="w-4 h-4" />
            Create Post
          </Link>
        </Button>
      </div>

      {/* Category Filter */}
      <CategoryFilter className="mb-4" />

      <div className="rounded-md border">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead className="w-[200px]">Slug</TableHead>
              <TableHead className="w-[120px]">Author</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[180px]">Tags</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading posts...
                  </div>
                </TableCell>
              </TableRow>
            ) : showSuccessIcon ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Posts loaded successfully
                  </div>
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No posts found
                </TableCell>
              </TableRow>
            ) : (
               posts.map((post, index) => {
                return (
                <TableRow 
                  key={post.slug}
                  onMouseEnter={() => handleMouseEnter(post.slug)}
                  onMouseLeave={handleMouseLeave}
                  className={hoveredRowSlug === post.slug ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    {editingCell?.postSlug === post.slug && editingCell?.field === 'title' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={handleSaveEdit} 
                          className="h-8 w-8 cursor-pointer"
                          title="Save (Enter)"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={handleCancelEdit} 
                          className="h-8 w-8 cursor-pointer"
                          title="Cancel (Escape)"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="font-semibold cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onDoubleClick={() => handleDoubleClick(post.slug, 'title', post.title)}
                      >
                        {post.title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.postSlug === post.slug && editingCell?.field === 'slug' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={handleSaveEdit} 
                          className="h-8 w-8 cursor-pointer"
                          title="Save (Enter)"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={handleCancelEdit} 
                          className="h-8 w-8 cursor-pointer"
                          title="Cancel (Escape)"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onDoubleClick={() => handleDoubleClick(post.slug, 'slug', post.slug)}
                      >
                        /{post.slug}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {post.author || '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {post.category || '—'}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(post.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {post.tags && post.tags.length > 0 ? (
                        post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs  ">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                      {post.tags && post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={`/en/blog/${post.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={`/admin/posts/${post.slug}/edit` as any}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the post "{post.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePost(post.slug)}
                              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={!pagination.hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {generatePageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <span className="flex h-9 w-9 items-center justify-center">
                      ...
                    </span>
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page as number)}
                      isActive={page === pagination.page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      </div>
    </>
  );
}
