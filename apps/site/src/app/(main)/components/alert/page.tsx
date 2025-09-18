import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import AlertDemo from "@/components/widgets/alert/alert";
import AlertDestructiveDemo from "@/components/widgets/alert/alert-destructive";
import AlertSuccessDemo from "@/components/widgets/alert/alert-success";
import AlertWarningDemo from "@/components/widgets/alert/alert-warning";
import AlertInfoDemo from "@/components/widgets/alert/alert-info";
import AlertWithBackgroundDemo from "@/components/widgets/alert/alert-with-background";
import AlertSoftDemo from "@/components/widgets/alert/alert-soft";
import AlertBootstrapDemo from "@/components/widgets/alert/alert-bootstrap";
import AlertCalloutDemo from "@/components/widgets/alert/alert-callout";
import AlertWithActionsDemo from "@/components/widgets/alert/alert-with-actions";

export default function AlertPage() {
  const t = useTranslations('alert');
  const locale = useLocale();
  const demoSections = [
    {
      title: t('variants.primary.title'),
      description: t('variants.primary.description'),
      component: <AlertDemo />
    },
    {
      title: t('variants.destructive.title'),
      description: t('variants.destructive.description'),
      component: <AlertDestructiveDemo />
    },
    {
      title: t('variants.success.title'),
      description: t('variants.success.description'),
      component: <AlertSuccessDemo />
    },
    {
      title: t('variants.warning.title'),
      description: t('variants.warning.description'),
      component: <AlertWarningDemo />
    },
    {
      title: t('variants.info.title'),
      description: t('variants.info.description'),
      component: <AlertInfoDemo />
    },
    {
      title: t('variants.withBackground.title'),
      description: t('variants.withBackground.description'),
      component: <AlertWithBackgroundDemo />
    },
    {
      title: t('variants.soft.title'),
      description: t('variants.soft.description'),
      component: <AlertSoftDemo />
    },
    {
      title: t('variants.bootstrap.title'),
      description: t('variants.bootstrap.description'),
      component: <AlertBootstrapDemo />
    },
    {
      title: t('variants.callout.title'),
      description: t('variants.callout.description'),
      component: <AlertCalloutDemo />
    },
    {
      title: t('variants.withActions.title'),
      description: t('variants.withActions.description'),
      component: <AlertWithActionsDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        description=""
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
