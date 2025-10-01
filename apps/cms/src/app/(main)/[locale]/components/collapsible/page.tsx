import { ComponentsHeader } from "@/components/misc/components-header";
import { ToTopButton } from "@/components/misc/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  CollapsibleDefault,
  CollapsibleShowMore,
  CollapsibleFileTree,
  CollapsibleFilters,
} from "@/components/widgets/collapsible";

export default function CollapsibleComponentsPage() {
  const t = useTranslations('demo.collapsible');
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <CollapsibleDefault />
    },
    {
      title: t('variants.showMore.title'),
      description: t('variants.showMore.description'),
      component: <CollapsibleShowMore />
    },
    {
      title: t('variants.fileTree.title'),
      description: t('variants.fileTree.description'),
      component: <CollapsibleFileTree />
    },
    {
      title: t('variants.filters.title'),
      description: t('variants.filters.description'),
      component: <CollapsibleFilters />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        description=""
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
