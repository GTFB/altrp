import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  DropdownDefault,
  DropdownWithIcon,
  DropdownCheckboxes,
  DropdownRadioGroup,
  DropdownSubMenu,
  DropdownShortcuts,
  DropdownComplex,
  DropdownWorkspaceSwitcher,
} from "@/components/widgets/dropdown";

export default function DropdownComponentsPage() {
  const t = useTranslations('demo.dropdown');
  const locale = useLocale();
  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <DropdownDefault />
    },
    {
      title: t('variants.withIcon.title'),
      description: t('variants.withIcon.description'),
      component: <DropdownWithIcon />
    },
    {
      title: t('variants.checkboxes.title'),
      description: t('variants.checkboxes.description'),
      component: <DropdownCheckboxes />
    },
    {
      title: t('variants.radioGroup.title'),
      description: t('variants.radioGroup.description'),
      component: <DropdownRadioGroup />
    },
    {
      title: t('variants.subMenu.title'),
      description: t('variants.subMenu.description'),
      component: <DropdownSubMenu />
    },
    {
      title: t('variants.shortcuts.title'),
      description: t('variants.shortcuts.description'),
      component: <DropdownShortcuts />
    },
    {
      title: t('variants.complex.title'),
      description: t('variants.complex.description'),
      component: <DropdownComplex />
    },
    {
      title: t('variants.workspaceSwitcher.title'),
      description: t('variants.workspaceSwitcher.description'),
      component: <DropdownWorkspaceSwitcher />
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
