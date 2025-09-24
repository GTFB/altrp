'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipTapEditor } from '@/components/features/cms/TipTapEditor';
import { MediaUpload } from '@/components/features/cms/MediaUpload';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSlugValidation } from '@/hooks/use-slug-validation';
import { textToSlug } from '@/lib/transliteration';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';

interface Post {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
  category?: string;
  author?: string;
  media?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface Author {
  slug: string;
  name: string;
  avatar?: string;
  bio?: string;
}

interface Category {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    excerpt: '',
    content: '',
    tags: '',
    category: '',
    author: '',
    media: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const { isValid: isSlugValid, error: slugError, isChecking: isCheckingSlug, checkSlug, resetValidation } = useSlugValidation({
    currentSlug: slug
  });
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  useEffect(() => {
    fetchPost();
    fetchAuthorsAndCategories();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blog/${slug}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.post);
        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          description: data.post.description || '',
          excerpt: data.post.excerpt || '',
          content: data.post.content || '',
          tags: data.post.tags ? data.post.tags.join(', ') : '',
          category: data.post.category || '',
          author: data.post.author || '',
          media: data.post.media || '',
          seoTitle: data.post.seoTitle || '',
          seoDescription: data.post.seoDescription || '',
          seoKeywords: data.post.seoKeywords || '',
        });
      } else {
        setError(data.error || 'Failed to fetch post');
      }
    } catch (err) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorsAndCategories = async () => {
    try {
      const [authorsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/authors'),
        fetch('/api/admin/categories')
      ]);

      const authorsData = await authorsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (authorsData.success) {
        setAuthors(authorsData.authors);
      }
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Error fetching authors and categories:', error);
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      const response = await fetch(`/api/admin/blog/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || undefined,
          date: undefined,
          tags: tagsArray,
          excerpt: formData.excerpt || undefined,
          content: formData.content,
          category: formData.category || undefined,
          author: formData.author || undefined,
          media: formData.media || undefined,
          seoTitle: formData.seoTitle || undefined,
          seoDescription: formData.seoDescription || undefined,
          seoKeywords: formData.seoKeywords || undefined,
          newSlug: formData.slug !== slug ? formData.slug : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success!', 'Post updated successfully');
        setTimeout(() => {
          router.push('/admin/posts');
        }, 1000);
      } else {
        showError('Error', data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showError('Error', 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading post...</div>
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

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Post not found</div>
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
            <Link href="/admin/posts">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Post</h1>
            <p className="text-muted-foreground">
              Update the post "{post.title}"
            </p>
          </div>
        </div>

        <Card className="max-h-[calc(100vh-100px)]">
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>
              Update the information for this blog post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full max-h-[calc(100vh-330px)] overflow-y-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Post Details</TabsTrigger>
                  <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
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
                          placeholder="Enter post title"
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
                            placeholder="post-url-slug"
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
                          URL: /blog/{formData.slug}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Select value={formData.author} onValueChange={(value) => handleSelectChange('author', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an author" />
                          </SelectTrigger>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author.slug} value={author.slug}>
                                {author.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.slug} value={category.slug}>
                                {category.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Brief description of the post"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          placeholder="Short excerpt for the post"
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
                        <MediaUpload
                          value={formData.media}
                          onChange={(value) => setFormData(prev => ({ ...prev, media: value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <TipTapEditor
                      content={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Write your post content..."
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
                      If empty, the post title will be used
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
                      If empty, the post description will be used
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
                  <Link href="/admin/posts">Cancel</Link>
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
