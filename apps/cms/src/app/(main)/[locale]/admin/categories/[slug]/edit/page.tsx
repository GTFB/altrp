'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TipTapEditor } from '@/components/blocks-app/cms/TipTapEditor';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSlugValidation } from '@/hooks/use-slug-validation';
import { textToSlug } from '@/lib/transliteration';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';

interface Category {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
  });

  const { isValid: isSlugValid, error: slugError, isChecking: isCheckingSlug, checkSlug, resetValidation } = useSlugValidation({
    currentSlug: slug
  });
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  const fetchCategory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.category);
        setFormData({
          title: data.category.title,
          slug: data.category.slug,
          excerpt: data.category.excerpt || '',
          content: data.category.content || '',
          tags: data.category.tags ? data.category.tags.join(', ') : '',
        });
      } else {
        setError(data.error || 'Failed to fetch category');
      }
    } catch (err) {
      setError('Failed to fetch category');
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);
  useEffect(() => {
    fetchCategory();
  }, [slug, fetchCategory]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset validation when user starts typing
    resetValidation();

    // Auto-generate slug from title with transliteration
    if (name === 'title') {
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

  const handleTitleBlur = () => {
    // Check slug if it was auto-generated from title and is different from current
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
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`/api/admin/categories/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          newSlug: formData.slug !== slug ? formData.slug : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success!', 'Category updated successfully');
        setTimeout(() => {
          router.push('/admin/categories');
        }, 1000);
      } else {
        showError('Error', data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Error', 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading category...</div>
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

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Category not found</div>
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
          <Link href="/admin/categories">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground">
            Update the category &quot;{category.title}&quot;
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Update the information for this category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={handleTitleBlur}
                    placeholder="Enter category title"
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
                      placeholder="category-url-slug"
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
                    URL: /categories/{formData.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief description of the category"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write detailed information about the category..."
                />
                <p className="text-sm text-muted-foreground">
                  Rich text editor with Markdown support
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/categories">Cancel</Link>
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
