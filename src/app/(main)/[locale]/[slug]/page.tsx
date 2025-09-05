import { notFound } from 'next/navigation';
import { PageRepository } from '@/repositories/page.repository';
import { MediaRepository } from '@/repositories/media.repository';
import { MediaDisplay } from '@/components/features/cms/MediaDisplay';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export default async function Page({ params }: PageProps) {
  
  const pageRepository = PageRepository.getInstance();
  const page = await pageRepository.findBySlug(params.slug);

  if (!page) {
    notFound();
  }

  // Load media data if page has media field
  let mediaData = null;
  if (page.media) {
    const mediaRepository = MediaRepository.getInstance();
    mediaData = await mediaRepository.findBySlug(page.media);
  }

  try {

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          {page.description && (
            <p className="text-xl text-muted-foreground">{page.description}</p>
          )}
        </header>
        
        {mediaData && (
          <div className="mb-8">
            <MediaDisplay 
              media={mediaData} 
              className="w-full h-auto rounded-lg shadow-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              showTitle={true}
              showDescription={true}
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }}>
        </div>
      </article>
    );
  } catch {
    notFound();
  }
}
