import { TagList } from '@/components/TagList/TagList';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout/Container';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tags | Jambo Blog',
  description: 'Explore our content organized by tags.',
};

export default function TagsPage() {
  const t = useTranslations('tags');
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
