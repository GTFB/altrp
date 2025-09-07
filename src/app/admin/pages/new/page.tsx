'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipTapEditor } from '@/components/features/cms/TipTapEditor';
import { MediaUpload } from '@/components/features/cms/MediaUpload';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSlugValidation } from '@/hooks/use-slug-validation';
import { textToSlug } from '@/lib/transliteration';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';

export default function NewPagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    excerpt: '',
    content: '',
    tags: '',
    media: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const { isValid: isSlugValid, error: slugError, isChecking: isCheckingSlug, checkSlug, resetValidation } = useSlugValidation();
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

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
      const slug = textToSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: slug
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
    if (formData.slug) {
      checkSlug(formData.slug);
    }
  };

  const handleTitleBlur = () => {
    // Check slug if it was auto-generated from title
    if (formData.slug) {
      checkSlug(formData.slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if slug is invalid
    if (!isSlugValid) {
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success!', 'Page created successfully');
        setTimeout(() => {
          router.push('/admin/pages');
        }, 1000);
      } else {
        showError('Error', data.error || 'Failed to create page');
      }
    } catch (error) {
      console.error('Error creating page:', error);
      showError('Error', 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Page</h1>
            <p className="text-muted-foreground">
              Add a new static page to your site
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Fill in the information for your new page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Page Details</TabsTrigger>
                  <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          onBlur={handleTitleBlur}
                          placeholder="Enter page title"
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
                            placeholder="page-url-slug"
                            required
                            className={!isSlugValid && formData.slug ? 'border-red-500 focus:border-red-500' : ''}
                          />
                          {isCheckingSlug && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            </div>
                          )}
                        </div>
                        {!isSlugValid && formData.slug && slugError && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            {slugError}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          URL: /{formData.slug}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <MediaUpload
                        value={formData.media}
                        onChange={(value) => setFormData(prev => ({ ...prev, media: value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the page"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Short excerpt for the page"
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

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <TipTapEditor
                      content={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Write your page content..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Rich text editor with Markdown support
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="Custom title for search engines"
                    />
                    <p className="text-sm text-muted-foreground">
                      If empty, the page title will be used
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      placeholder="Meta description for search engines"
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      If empty, the page description will be used
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seoKeywords">SEO Keywords</Label>
                    <Input
                      id="seoKeywords"
                      name="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-sm text-muted-foreground">
                      Comma-separated keywords for SEO
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/pages">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading || !isSlugValid || isCheckingSlug}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Page'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
