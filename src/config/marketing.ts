import type { DefaultSeoProps } from 'next-seo';

export const defaultSeo: DefaultSeoProps = {
  titleTemplate: '%s | Jambo',
  defaultTitle: 'Jambo',
  description: 'Git-as-CMS powered site',
  openGraph: {
    type: 'website',
    siteName: 'Jambo',
  },
};
