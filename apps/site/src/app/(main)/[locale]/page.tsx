import { BlogSection, CategorySection, CategoryPostsSection, AuthorSection, AuthorPostsSection, TagSection } from '@/components/features/blog';
import { Container } from '@/components/layout/Container';
import { useTranslations } from 'next-intl';
export default function LocalizedHome({ params }: { params: { locale: string } }) {
  const t = useTranslations('home');
  return (
    <Container className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Jambo</h1>
        <p className="text-xl text-muted-foreground">
          A modern Git-as-CMS powered website
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Current locale: {params.locale}
        </p>
      </div>

      <div className="mt-8 p-4 bg-card border rounded-lg mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Components</h2>
        <p className="text-muted-foreground">
          All 50+ shadcn/ui components are ready to use!
        </p>
      </div>

      <BlogSection 
        limit={6}
        showViewAll={true}
        title={t('latestPosts')}
        description={t('readOurLatestArticlesAndUpdates')}
        sortBy="date"
        sortOrder="desc"
      />

      {/* Example usage of CategorySection - shows list of categories */}
      <CategorySection 
        limit={3}
        showViewAll={true}
        title={t('categories')}
        description={t('exploreOurContentOrganizedByTopics')}
      />


      {/* Example usage of AuthorSection - shows list of authors */}
      <AuthorSection 
        limit={3}
        showViewAll={true}
        title={t('ourAuthors')}
        description={t('meetTheTalentedWritersBehindOurContent')}
      />
      {/* Example usage of TagSection */}
      <TagSection 
        tags={['demo', 'hello']}
        limit={3}
        showViewAll={true}
        title={t('postsWithDemoAndHelloTags')}
        description={t('articlesWithPopularTags')}
      />
    </Container>  
  );
}
