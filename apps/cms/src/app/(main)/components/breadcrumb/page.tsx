import { ComponentsHeader } from "@/components/misc/components-header";
import { ToTopButton } from "@/components/misc/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  BreadcrumbDemo,
  BreadcrumbSlashSeparatorDemo,
  BreadcrumbChevronsSeparatorDemo,
  BreadcrumbDotSeparatorDemo,
  BreadcrumbWithIconDemo,
  BreadcrumbWithIcon2Demo,
  BreadcrumbWithIconAndLabelDemo,
  BreadcrumbWithIconAndLabel2Demo,
  BreadcrumbWithBackgroundDemo,
  BreadcrumbTabActiveDemo,
  BreadcrumbTabsDemo,
  BreadcrumbTabsOutlineDemo,
  BreadcrumbWithDropdownDemo,
  BreadcrumbCollapsedDemo,
  BreadcrumbStepsDemo
} from "@/components/widgets/breadcrumb";

export default function BreadcrumbPage() {
  const t = useTranslations('demo.breadcrumb');
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <BreadcrumbDemo />
    },
    {
      title: t('variants.slashSeparator.title'),
      description: t('variants.slashSeparator.description'),
      component: <BreadcrumbSlashSeparatorDemo />
    },
    {
      title: t('variants.chevronsSeparator.title'),
      description: t('variants.chevronsSeparator.description'),
      component: <BreadcrumbChevronsSeparatorDemo />
    },
    {
      title: t('variants.dotSeparator.title'),
      description: t('variants.dotSeparator.description'),
      component: <BreadcrumbDotSeparatorDemo />
    },
    {
      title: t('variants.withIcon.title'),
      description: t('variants.withIcon.description'),
      component: <BreadcrumbWithIconDemo />
    },
    {
      title: t('variants.withIcon2.title'),
      description: t('variants.withIcon2.description'),
      component: <BreadcrumbWithIcon2Demo />
    },
    {
      title: t('variants.withIconAndLabel.title'),
      description: t('variants.withIconAndLabel.description'),
      component: <BreadcrumbWithIconAndLabelDemo />
    },
    {
      title: t('variants.withIconAndLabel2.title'),
      description: t('variants.withIconAndLabel2.description'),
      component: <BreadcrumbWithIconAndLabel2Demo />
    },
    {
      title: t('variants.withBackground.title'),
      description: t('variants.withBackground.description'),
      component: <BreadcrumbWithBackgroundDemo />
    },
    {
      title: t('variants.tabActive.title'),
      description: t('variants.tabActive.description'),
      component: <BreadcrumbTabActiveDemo />
    },
    {
      title: t('variants.tabs.title'),
      description: t('variants.tabs.description'),
      component: <BreadcrumbTabsDemo />
    },
    {
      title: t('variants.tabsOutline.title'),
      description: t('variants.tabsOutline.description'),
      component: <BreadcrumbTabsOutlineDemo />
    },
    {
      title: t('variants.withDropdown.title'),
      description: t('variants.withDropdown.description'),
      component: <BreadcrumbWithDropdownDemo />
    },
    {
      title: t('variants.collapsed.title'),
      description: t('variants.collapsed.description'),
      component: <BreadcrumbCollapsedDemo />
    },
    {
      title: t('variants.steps.title'),
      description: t('variants.steps.description'),
      component: <BreadcrumbStepsDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        description={t('description')}
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
