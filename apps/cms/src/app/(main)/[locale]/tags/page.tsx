import { TagList } from '@/components/blocks-app/TagList';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/misc/layout/Container';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tags | Jambo Blog',
  description: 'Explore our content organized by tags.',
};

export default async function TagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tags' });
  return (
    <Container className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('tags')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('discover_our_content_organized_by_tags_and_keywords')}
        </p>
      </div>
      <TagList />
    </Container>
  );
}
