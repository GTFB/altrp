'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TipTapEditor } from '@/components/features/cms/TipTapEditor';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSlugValidation } from '@/hooks/use-slug-validation';
import { textToSlug } from '@/lib/transliteration';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';

interface Author {
  slug: string;
  name: string;
  avatar?: string;
  bio?: string;
  content?: string;
}

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [author, setAuthor] = useState<Author | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    avatar: '',
    bio: '',
    content: '',
  });

  const { isValid: isSlugValid, error: slugError, isChecking: isCheckingSlug, checkSlug, resetValidation } = useSlugValidation({
    currentSlug: slug
  });
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  useEffect(() => {
    fetchAuthor();
  }, [slug]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/authors/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setAuthor(data.author);
        setFormData({
          name: data.author.name,
          slug: data.author.slug,
          avatar: data.author.avatar || '',
          bio: data.author.bio || '',
          content: data.author.content || '',
        });
      } else {
        setError(data.error || 'Failed to fetch author');
      }
    } catch (err) {
      setError('Failed to fetch author');
      console.error('Error fetching author:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset validation when user starts typing
    resetValidation();

    // Auto-generate slug from name with transliteration
    if (name === 'name') {
      const newSlug = textToSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
    
    // Also transliterate slug field if user types in Cyrillic
    if (name === 'slug') {
      const transliteratedSlug = textToSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: transliteratedSlug
      }));
    }
  };

  const handleSlugBlur = () => {
    if (formData.slug && formData.slug !== slug) {
      checkSlug(formData.slug);
    }
  };

  const handleNameBlur = () => {
    // Check slug if it was auto-generated from name and is different from current
    if (formData.slug && formData.slug !== slug) {
      checkSlug(formData.slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if slug is invalid and has changed
    if (formData.slug !== slug && !isSlugValid) {
      return;
    }
    
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/authors/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          newSlug: formData.slug !== slug ? formData.slug : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success!', 'Author updated successfully');
        setTimeout(() => {
          router.push('/admin/authors');
        }, 1000);
      } else {
        showError('Error', data.error || 'Failed to update author');
      }
    } catch (error) {
      console.error('Error updating author:', error);
      showError('Error', 'Failed to update author');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading author...</div>
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

  if (!author) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Author not found</div>
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
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/authors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Author</h1>
          <p className="text-muted-foreground">
            Update the author "{author.name}"
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Author Details</CardTitle>
          <CardDescription>
            Update the information for this author
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleNameBlur}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      onBlur={handleSlugBlur}
                      placeholder="author-url-slug"
                      required
                      className={!isSlugValid && formData.slug !== slug ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {isCheckingSlug && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                  {!isSlugValid && formData.slug !== slug && slugError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {slugError}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    URL: /authors/{formData.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL to the author's avatar image
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief bio about the author"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write detailed information about the author..."
                />
                <p className="text-sm text-muted-foreground">
                  Rich text editor with Markdown support
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/authors">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving || (formData.slug !== slug && (!isSlugValid || isCheckingSlug))}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
