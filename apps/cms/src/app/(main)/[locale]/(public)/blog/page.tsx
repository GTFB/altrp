import { PostList } from '@/components/blocks-app/blog/PostList/PostList';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/misc/layout/Container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | altrp Blog',
  description: 'Explore our content organized by tags.',
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-8">{t('blog')}</h1>
      <PostList noPostsFound={t('noPostsFound')}/>
    </Container>
  );
}
