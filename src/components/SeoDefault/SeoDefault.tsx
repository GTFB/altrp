import { DefaultSeo } from 'next-seo';
import { defaultSeo } from '@/config/marketing';

export function SeoDefault() {
  return <DefaultSeo {...defaultSeo} />;
}
