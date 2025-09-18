import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  CarouselDefaultDemo,
  CarouselMultipleSlidesDemo,
  CarouselVerticalDemo,
  CarouselSlideStatusDemo,
  CarouselSlideStatus2Demo,
  CarouselPaginationDemo,
  CarouselFooterDemo,
  CarouselProgressDemo,
  CarouselThumbsDemo,
  CarouselOpacityDemo,
  CarouselScaleDemo
} from "@/components/widgets/carousel";

export default function CarouselPage() {
  const t = useTranslations('demo.carousel');
  const locale = useLocale();
  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <CarouselDefaultDemo />
    },
    {
      title: t('variants.multipleSlides.title'),
      description: t('variants.multipleSlides.description'),
      component: <CarouselMultipleSlidesDemo />
    },
    {
      title: t('variants.vertical.title'),
      description: t('variants.vertical.description'),
      component: <CarouselVerticalDemo />
    },
    {
      title: t('variants.slideStatus.title'),
      description: t('variants.slideStatus.description'),
      component: <CarouselSlideStatusDemo />
    },
    {
      title: t('variants.slideStatus2.title'),
      description: t('variants.slideStatus2.description'),
      component: <CarouselSlideStatus2Demo />
    },
    {
      title: t('variants.pagination.title'),
      description: t('variants.pagination.description'),
      component: <CarouselPaginationDemo />
    },
    {
      title: t('variants.footer.title'),
      description: t('variants.footer.description'),
      component: <CarouselFooterDemo />
    },
    {
      title: t('variants.progress.title'),
      description: t('variants.progress.description'),
      component: <CarouselProgressDemo />
    },
    {
      title: t('variants.thumbs.title'),
      description: t('variants.thumbs.description'),
      component: <CarouselThumbsDemo />
    },
    {
      title: t('variants.opacity.title'),
      description: t('variants.opacity.description'),
      component: <CarouselOpacityDemo />
    },
    {
      title: t('variants.scale.title'),
      description: t('variants.scale.description'),
      component: <CarouselScaleDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        description={t('description')}
        showBackButton={true}
        backHref={`/${locale}/components`}
        badges={[]}
      />
      
      <div className={`mx-auto py-8 space-y-12 max-w-7xl ${PROJECT_SETTINGS.mobilePadding}`}>
        {/* Description Section */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {demoSections.map((section, index) => (
          <div key={index} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{section.title}</h3>
              <p className="text-muted-foreground">{section.description}</p>
            </div>
            <div className="w-full">
              {section.component}
            </div>
          </div>
        ))}

        {/* Usage Section */}
        <Card className={`mt-12 ${cardStyles.info}`}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:text-left sm:space-y-0 sm:space-x-4">
              <div className="h-6 w-6 text-secondary-foreground flex-shrink-0">ℹ️</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{t('usage.title')}</h3>
                <p className="text-sm text-secondary-foreground">
                  {t('usage.description')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ToTopButton />
    </div>
  );
}
