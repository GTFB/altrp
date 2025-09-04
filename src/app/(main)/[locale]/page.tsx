import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

interface LocalizedHomeProps {
  params: { locale: string };
}

export default async function LocalizedHome({ params }: LocalizedHomeProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Index' });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-xl text-muted-foreground">{t('description')}</p>
    </div>
  );
}
