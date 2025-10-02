import { PostRepository } from '@/repositories/post.repository';
import { Metadata } from 'next';
import { Tag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { TagPostList } from '@/components/blocks-app/blog/TagPostList';
import { Container } from '@/components/misc/layout/Container';
export const dynamic = 'force-dynamic';

interface TagPageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findByTag(params.slug);

  if (posts.length === 0) {
    return {
      title: 'Tag Not Found | altrp Blog',
      description: 'The requested tag could not be found.',
    };
  }

  const tagName = params.slug;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://altrp.example.com';
  const tagUrl = `${baseUrl}/${params.locale}/tags/${params.slug}`;

  return {
    title: `${tagName} | Tags | altrp Blog`,
    description: `Read articles tagged with ${tagName}`,
    keywords: tagName,
    openGraph: {
      title: `Articles tagged with ${tagName}`,
      description: `Read articles tagged with ${tagName}`,
      type: 'website',
      url: tagUrl,
      locale: params.locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: 'altrp Blog',
    },
    twitter: {
      card: 'summary',
      title: `Articles tagged with ${tagName}`,
      description: `Read articles tagged with ${tagName}`,
    },
    alternates: {
      canonical: tagUrl,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
 

  const tagName = params.slug;
  const t = await getTranslations({ locale: params.locale, namespace: 'tags' });
  return (
    <Container className="py-8">
      {/* Tag Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Tag className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">#{tagName}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
           {t('tagged_with_this_keyword')} {tagName}
        </p>
      </div>

      {/* Tagged Posts */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t('articles_tagged_with')} #{tagName}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TagPostList slug={tagName}/>          
        </div>
      </div>
    </Container>
  );
}
