'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TipTapEditor } from '@/components/blocks-app/cms/TipTapEditor';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSlugValidation } from '@/hooks/use-slug-validation';
import { textToSlug } from '@/lib/transliteration';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationContainer } from '@/components/ui/notification-container';

export default function NewAuthorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    avatar: '',
    bio: '',
    content: '',
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

    // Auto-generate slug from name with transliteration
    if (name === 'name') {
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

  const handleNameBlur = () => {
    // Check slug if it was auto-generated from name
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
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success!', 'Author created successfully');
        setTimeout(() => {
          router.push('/admin/authors');
        }, 1000);
      } else {
        showError('Error', data.error || 'Failed to create author');
      }
    } catch (error) {
      console.error('Error creating author:', error);
      showError('Error', 'Failed to create author');
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
            <Link href="/admin/authors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Author</h1>
            <p className="text-muted-foreground">
              Add a new author to your site
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Author Details</CardTitle>
            <CardDescription>
              Fill in the information for the new author
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
                <Button type="submit" disabled={loading || !isSlugValid || isCheckingSlug}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Author'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
