import { useTranslations } from 'next-intl';

export default function LocalizedHome() {
  const t = useTranslations('common');
  
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">{t('welcome')}</h1>
      <p className="text-muted-foreground mt-2">{t('hello')}</p>
    </main>
  );
}
