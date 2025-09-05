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

interface Page {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ pageSlug: string; field: 'title' | 'slug' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pages');
      const data = await response.json();
      
      if (data.success) {
        setPages(data.pages);
      } else {
        setError(data.error || 'Failed to fetch pages');
      }
    } catch (err) {
      setError('Failed to fetch pages');
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/pages?slug=${slug}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Success!', 'Page deleted successfully');
        // Refresh the pages list
        await fetchPages();
      } else {
        showError('Error', data.error || 'Failed to delete page');
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      showError('Error', 'Failed to delete page');
    }
  };

  const handleDoubleClick = (pageSlug: string, field: 'title' | 'slug', currentValue: string) => {
    setEditingCell({ pageSlug, field });
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
      const response = await fetch(`/api/admin/pages/${editingCell.pageSlug}`, {
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
        showSuccess('Success!', 'Page updated successfully');
        
        // If slug was changed, refresh the entire list to get updated data
        if (editingCell.field === 'slug' && editValue !== editingCell.pageSlug) {
          await fetchPages();
        } else {
          // Update local state for other fields
          setPages(prev => prev.map(page => 
            page.slug === editingCell.pageSlug 
              ? { ...page, [editingCell.field]: editValue }
              : page
          ));
        }
        
        setEditingCell(null);
        setEditValue('');
      } else {
        showError('Error', data.error || 'Failed to update page');
      }
    } catch (err) {
      console.error('Error updating page:', err);
      showError('Error', 'Failed to update page');
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
        <div className="text-muted-foreground">Loading pages...</div>
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
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground">
            Manage static pages of the site
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/pages/new">
            <Plus className="w-4 h-4" />
            Create Page
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pages found
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.slug}>
                  <TableCell className="font-medium">
                    {editingCell?.pageSlug === page.slug && editingCell?.field === 'title' ? (
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
                        onDoubleClick={() => handleDoubleClick(page.slug, 'title', page.title)}
                      >
                        {page.title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.pageSlug === page.slug && editingCell?.field === 'slug' ? (
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
                        onDoubleClick={() => handleDoubleClick(page.slug, 'slug', page.slug)}
                      >
                        /{page.slug}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {page.description || page.excerpt || '—'}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(page.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {page.tags && page.tags.length > 0 ? (
                        page.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                      {page.tags && page.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{page.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={`/en/${page.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={`/admin/pages/${page.slug}/edit` as any}>
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
                              This action cannot be undone. This will permanently delete the page "{page.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePage(page.slug)}
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
