import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  CheckboxWithText,
  DisabledCheckbox,
  IndeterminateCheckbox,
  CheckboxHorizontalGroup,
  CheckboxVerticalGroup,
  ControlledCheckbox,
  CheckboxColors,
  CheckboxSizes,
  CheckboxIcon,
  CheckboxMultiColorPicker,
  CheckboxCard,
  CheckboxWithForm,
} from "@/components/widgets/checkbox";

export default function CheckboxComponentsPage() {
  const t = useTranslations('demo.checkbox');
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const demoSections = [
    {
      title: t('variants.withText.title'),
      description: t('variants.withText.description'),
      component: <CheckboxWithText />
    },
    {
      title: t('variants.disabled.title'),
      description: t('variants.disabled.description'),
      component: <DisabledCheckbox />
    },
    {
      title: t('variants.indeterminate.title'),
      description: t('variants.indeterminate.description'),
      component: <IndeterminateCheckbox />
    },
    {
      title: t('variants.horizontalGroup.title'),
      description: t('variants.horizontalGroup.description'),
      component: <CheckboxHorizontalGroup />
    },
    {
      title: t('variants.verticalGroup.title'),
      description: t('variants.verticalGroup.description'),
      component: <CheckboxVerticalGroup />
    },
    {
      title: t('variants.controlled.title'),
      description: t('variants.controlled.description'),
      component: <ControlledCheckbox />
    },
    {
      title: t('variants.colors.title'),
      description: t('variants.colors.description'),
      component: <CheckboxColors />
    },
    {
      title: t('variants.sizes.title'),
      description: t('variants.sizes.description'),
      component: <CheckboxSizes />
    },
    {
      title: t('variants.icon.title'),
      description: t('variants.icon.description'),
      component: <CheckboxIcon />
    },
    {
      title: t('variants.multiColorPicker.title'),
      description: t('variants.multiColorPicker.description'),
      component: <CheckboxMultiColorPicker />
    },
    {
      title: t('variants.card.title'),
      description: t('variants.card.description'),
      component: <CheckboxCard />
    },
    {
      title: t('variants.withForm.title'),
      description: t('variants.withForm.description'),
      component: <CheckboxWithForm />
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
