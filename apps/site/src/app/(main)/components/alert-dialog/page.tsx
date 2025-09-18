import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import AlertDialogDemo from "@/components/widgets/alert-dialog/alert-dialog";
import AlertDialogWithIconDemo from "@/components/widgets/alert-dialog/alert-dialog-with-icon";
import AlertDialogDestructiveDemo from "@/components/widgets/alert-dialog/alert-dialog-destructive";
import AlertDialogSuccessDemo from "@/components/widgets/alert-dialog/alert-dialog-success";
import AlertDialogWarningDemo from "@/components/widgets/alert-dialog/alert-dialog-warning";
import AlertDialogInfoDemo from "@/components/widgets/alert-dialog/alert-dialog-info";
import AlertDialogCustomDemo from "@/components/widgets/alert-dialog/alert-dialog-custom";
import AlertDialogFormDemo from "@/components/widgets/alert-dialog/alert-dialog-form";
import AlertDialogScrollableDemo from "@/components/widgets/alert-dialog/alert-dialog-scrollable";
import AlertDialogAnimatedDemo from "@/components/widgets/alert-dialog/alert-dialog-animated";

export default function AlertDialogPage() {
  const t = useTranslations('alertDialog');
  const locale = useLocale();
  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <AlertDialogDemo />
    },
    {
      title: t('variants.withIcon.title'),
      description: t('variants.withIcon.description'),
      component: <AlertDialogWithIconDemo />
    },
    {
      title: t('variants.destructive.title'),
      description: t('variants.destructive.description'),
      component: <AlertDialogDestructiveDemo />
    },
    {
      title: t('variants.success.title'),
      description: t('variants.success.description'),
      component: <AlertDialogSuccessDemo />
    },
    {
      title: t('variants.warning.title'),
      description: t('variants.warning.description'),
      component: <AlertDialogWarningDemo />
    },
    {
      title: t('variants.info.title'),
      description: t('variants.info.description'),
      component: <AlertDialogInfoDemo />
    },
    {
      title: t('variants.custom.title'),
      description: t('variants.custom.description'),
      component: <AlertDialogCustomDemo />
    },
    {
      title: t('variants.form.title'),
      description: t('variants.form.description'),
      component: <AlertDialogFormDemo />
    },
    {
      title: t('variants.scrollable.title'),
      description: t('variants.scrollable.description'),
      component: <AlertDialogScrollableDemo />
    },
    {
      title: t('variants.animated.title'),
      description: t('variants.animated.description'),
      component: <AlertDialogAnimatedDemo />
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
            <h3 className="text-2xl font-semibold font-heading">{section.title}</h3>
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
