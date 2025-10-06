import type { DefaultSeoProps } from 'next-seo';

export const defaultSeo: DefaultSeoProps = {
  titleTemplate: '%s | altrp',
  defaultTitle: 'altrp',
  description: 'Git-as-CMS powered site',
  openGraph: {
    type: 'website',
    siteName: 'altrp',
  },
};
