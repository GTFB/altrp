import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {  Globe, Languages } from 'lucide-react';
import { HeroBlock } from '@/components/features/HeroBlock/HeroBlock';
import { Container } from '@/components/misc/layout/Container';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const { t } = useTranslations('Home');
  return (
    <main>
      <HeroBlock />
      
      {/* Language Selection Section */}
      <section className="py-20 bg-background">
        <Container >
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-bold font-heading">{t('chooseLanguage')}</CardTitle>
                <CardDescription className="font-sans">
                  {t('chooseLanguageDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/ru" className="block">
                  <Button variant="outline" className="w-full h-12 text-lg font-sans" size="lg">
                    <Languages className="w-5 h-5 mr-2" />
                    {t('russian')}
                  </Button>
                </Link>
                <Link href="/en" className="block">
                  <Button variant="outline" className="w-full h-12 text-lg font-sans" size="lg">
                    <Languages className="w-5 h-5 mr-2" />
                    {t('english')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <div className="text-center mt-6 text-sm text-muted-foreground font-sans">
              <p>Next.js + Bun + Tailwind + Shadcn/ui</p>
              <p className="mt-1 text-xs">{t('interText')}</p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
