import { ComponentsHeader } from "@/components/misc/components-header";
import { ToTopButton } from "@/components/misc/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  CardDefaultDemo,
  CardWithBackgroundDemo,
  CardSignUpDemo,
  CardBannerDemo,
  CardPricingDemo,
  CardPostDemo,
  CardProductDemo,
  CardTestimonialDemo
} from "@/components/widgets/card";

export default function CardPage() {
  const t = useTranslations('demo.card');
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <CardDefaultDemo />
    },
    {
      title: t('variants.withBackground.title'),
      description: t('variants.withBackground.description'),
      component: <CardWithBackgroundDemo />
    },
    {
      title: t('variants.signUp.title'),
      description: t('variants.signUp.description'),
      component: <CardSignUpDemo />
    },
    {
      title: t('variants.banner.title'),
      description: t('variants.banner.description'),
      component: <CardBannerDemo />
    },
    {
      title: t('variants.pricing.title'),
      description: t('variants.pricing.description'),
      component: <CardPricingDemo />
    },
    {
      title: t('variants.post.title'),
      description: t('variants.post.description'),
      component: <CardPostDemo />
    },
    {
      title: t('variants.product.title'),
      description: t('variants.product.description'),
      component: <CardProductDemo />
    },
    {
      title: t('variants.testimonial.title'),
      description: t('variants.testimonial.description'),
      component: <CardTestimonialDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        showBackButton={true}
        backHref={`${localePath}/components`}  
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
