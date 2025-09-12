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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface Author {
  slug: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ authorSlug: string; field: 'name' | 'slug' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  const [hoveredRowSlug, setHoveredRowSlug] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/authors');
      const data = await response.json();
      
      if (data.success) {
        setAuthors(data.authors);
      } else {
        setError(data.error || 'Failed to fetch authors');
      }
    } catch (err) {
      setError('Failed to fetch authors');
      console.error('Error fetching authors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (authorSlug: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredRowSlug(authorSlug);
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

  const handleDeleteAuthor = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/authors/${slug}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Success!', 'Author deleted successfully');
        // Refresh the authors list
        await fetchAuthors();
      } else {
        showError('Error', data.error || 'Failed to delete author');
      }
    } catch (err) {
      console.error('Error deleting author:', err);
      showError('Error', 'Failed to delete author');
    }
  };

  const handleDoubleClick = (authorSlug: string, field: 'name' | 'slug', currentValue: string) => {
    setEditingCell({ authorSlug, field });
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
      const response = await fetch(`/api/admin/authors/${editingCell.authorSlug}`, {
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
        showSuccess('Success!', 'Author updated successfully');
        
        // If slug was changed, refresh the entire list to get updated data
        if (editingCell.field === 'slug' && editValue !== editingCell.authorSlug) {
          await fetchAuthors();
        } else {
          // Update local state for other fields
          setAuthors(prev => prev.map(author => 
            author.slug === editingCell.authorSlug 
              ? { ...author, [editingCell.field]: editValue }
              : author
          ));
        }
        
        setEditingCell(null);
        setEditValue('');
      } else {
        showError('Error', data.error || 'Failed to update author');
      }
    } catch (err) {
      console.error('Error updating author:', err);
      showError('Error', 'Failed to update author');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading authors...</div>
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
          <h1 className="text-2xl font-bold">Authors</h1>
          <p className="text-muted-foreground">
            Manage blog authors
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/authors/new">
            <Plus className="w-4 h-4" />
            Create Author
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No authors found
                </TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow 
                  key={author.slug}
                  onMouseEnter={() => handleMouseEnter(author.slug)}
                  onMouseLeave={handleMouseLeave}
                  className={hoveredRowSlug === author.slug ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {editingCell?.authorSlug === author.slug && editingCell?.field === 'name' ? (
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
                        onDoubleClick={() => handleDoubleClick(author.slug, 'name', author.name)}
                      >
                        {author.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.authorSlug === author.slug && editingCell?.field === 'slug' ? (
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
                        onDoubleClick={() => handleDoubleClick(author.slug, 'slug', author.slug)}
                      >
                        /{author.slug}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {author.bio || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={`/en/authors/${author.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                        <Link href={`/admin/authors/${author.slug}/edit` as any}>
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
                              This action cannot be undone. This will permanently delete the author "{author.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAuthor(author.slug)}
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
