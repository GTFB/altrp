'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Eye, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';

interface Category {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ categorySlug: string; field: 'title' | 'slug' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  const [hoveredRowSlug, setHoveredRowSlug] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (categorySlug: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredRowSlug(categorySlug);
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

  const handleDeleteCategory = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${slug}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Success!', 'Category deleted successfully');
        // Refresh the categories list
        await fetchCategories();
      } else {
        showError('Error', data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      showError('Error', 'Failed to delete category');
    }
  };

  const handleDoubleClick = (categorySlug: string, field: 'title' | 'slug', currentValue: string) => {
    setEditingCell({ categorySlug, field });
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
      const response = await fetch(`/api/admin/categories/${editingCell.categorySlug}`, {
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
        showSuccess('Success!', 'Category updated successfully');
        
        // If slug was changed, refresh the entire list to get updated data
        if (editingCell.field === 'slug' && editValue !== editingCell.categorySlug) {
          await fetchCategories();
        } else {
          // Update local state for other fields
          setCategories(prev => prev.map(category => 
            category.slug === editingCell.categorySlug 
              ? { ...category, [editingCell.field]: editValue }
              : category
          ));
        }
        
        setEditingCell(null);
        setEditValue('');
      } else {
        showError('Error', data.error || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      showError('Error', 'Failed to update category');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage blog categories
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/categories/new">
            <Plus className="w-4 h-4" />
            Create Category
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Excerpt</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow 
                  key={category.slug}
                  onMouseEnter={() => handleMouseEnter(category.slug)}
                  onMouseLeave={handleMouseLeave}
                  className={hoveredRowSlug === category.slug ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    {editingCell?.categorySlug === category.slug && editingCell?.field === 'title' ? (
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
                        onDoubleClick={() => handleDoubleClick(category.slug, 'title', category.title)}
                      >
                        {category.title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.categorySlug === category.slug && editingCell?.field === 'slug' ? (
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
                        onDoubleClick={() => handleDoubleClick(category.slug, 'slug', category.slug)}
                      >
                        /{category.slug}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {category.excerpt || '—'}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(category.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {category.tags && category.tags.length > 0 ? (
                        category.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                      {category.tags && category.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={{
                          pathname: `/en/categories/${category.slug}`,
                        }} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={{
                          pathname: `/admin/categories/${category.slug}/edit`,
                        }}>
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
                              This action cannot be undone. This will permanently delete the category &quot;{category.title}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.slug)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </div>
    </>
  );
}
