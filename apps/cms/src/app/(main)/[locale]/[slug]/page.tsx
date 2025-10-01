import { notFound } from 'next/navigation';
import { PageRepository } from '@/repositories/page.repository';
import { MediaRepository } from '@/repositories/media.repository';
import { MediaDisplay } from '@/components/blocks-app/cms/MediaDisplay';
import { Container } from '@/components/misc/layout/Container';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

interface PagePropsWithLocale {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: PagePropsWithLocale): Promise<Metadata> {
  const pageRepository = PageRepository.getInstance();
  const page = await pageRepository.findBySlug(params.slug);

  if (!page) {
    return {
      title: 'Page Not Found | Jambo',
      description: 'The requested page could not be found.',
    };
  }

  // Load media data if page has media field
  let mediaData = null;
  if (page.media) {
    const mediaRepository = MediaRepository.getInstance();
    mediaData = await mediaRepository.findBySlug(page.media);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jambo.example.com';
  const pageUrl = `${baseUrl}/${params.locale}/${params.slug}`;
  
  // Build image URL if media exists
  const imageUrl = mediaData ? `${baseUrl}${mediaData.url}` : undefined;

  return {
    title: page.title ? `${page.title} | Jambo` : 'Jambo',
    description: page.description || `Read the page "${page.title}" on our site`,
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'website',
      url: pageUrl,
      locale: params.locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: 'Jambo',
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: mediaData?.alt || page.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      ...(imageUrl && {
        images: [imageUrl],
      }),
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

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
      <Container className="py-8 max-w-4xl">
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
      </Container>
    );
  } catch {
    notFound();
  }
}
