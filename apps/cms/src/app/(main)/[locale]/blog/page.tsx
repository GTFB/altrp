import { PostList } from '@/components/blocks-app/blog/PostList/PostList';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/misc/layout/Container';
export const dynamic = 'force-dynamic';

export default function BlogPage() {
  const t = useTranslations('blog');
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-8">{t('blog')}</h1>
      <PostList />
    </Container>
  );
}
