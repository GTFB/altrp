import { BlogSection, CategorySection, CategoryPostsSection, AuthorSection, AuthorPostsSection, TagSection } from '@/components/blocks-app/blog';
import { Container } from '@/components/misc/layout/Container';
import { getTranslations } from 'next-intl/server';
export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <Container className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('welcomeToaltrp')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('aModernGitAsCmsPoweredWebsite')}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {t('currentLocale')}: {locale}
        </p>
      </div>

      <div className="mt-8 p-4 bg-card border rounded-lg mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t('availableComponents')}</h2>
        <p className="text-muted-foreground">
          {t('all50ShadcnUiComponentsAreReadyToUse')}
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
