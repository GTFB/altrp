import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import ComponentLayoutDemo from "@/components/widgets/layout/component-layout-demo";
import DemoGridDemo from "@/components/widgets/layout/demo-grid-demo";
import CodeExampleDemo from "@/components/widgets/layout/code-example-demo";
import InlineCodeExampleDemo from "@/components/widgets/layout/inline-code-example-demo";
import VariantDemoDemo from "@/components/widgets/layout/variant-demo-demo";

export default function LayoutComponentsPage() {
  const t = useTranslations('layout');
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const demoSections = [
    {
      title: t('components.componentLayout.title'),
      description: t('components.componentLayout.description'),
      component: <ComponentLayoutDemo />
    },
    {
      title: t('components.demoGrid.title'),
      description: t('components.demoGrid.description'),
      component: <DemoGridDemo />
    },
    {
      title: t('components.codeExample.title'),
      description: t('components.codeExample.description'),
      component: <CodeExampleDemo />
    },
    {
      title: t('components.inlineCodeExample.title'),
      description: t('components.inlineCodeExample.description'),
      component: <InlineCodeExampleDemo />
    },
    {
      title: t('components.variantDemo.title'),
      description: t('components.variantDemo.description'),
      component: <VariantDemoDemo />
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
