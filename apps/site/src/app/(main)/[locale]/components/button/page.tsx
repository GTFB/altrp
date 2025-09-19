import { ComponentsHeader } from "@/components/shared/components-header";
import { ToTopButton } from "@/components/shared/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useLocale, useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  ButtonPrimaryDemo,
  ButtonSecondaryDemo,
  ButtonDestructiveDemo,
  ButtonOutlineDemo,
  ButtonIconDemo,
  ButtonLoadingDemo,
  ButtonSplitDemo,
  ButtonGhostDemo,
  ButtonGradientDemo,
  ButtonLinkDemo,
  ButtonSocialDemo,
  ButtonSocialLoginDemo,
  ButtonNeonDemo,
  ButtonRoundedDemo,
  ButtonToggleDemo,
  ButtonThemeToggleDemo,
  ButtonFullWidthDemo,
  ButtonGroupDemo,
  ButtonGroup2Demo,
  ButtonCopyDemo,
  ButtonWithBadgeDemo,
  ButtonWithTooltipDemo,
  ButtonWithTapAnimationDemo
} from "@/components/widgets/button";

export default function ButtonPage() {
  const t = useTranslations('demo.button');
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const demoSections = [
    {
      title: t('variants.primary'),
      description: t('variants.primaryDescription'),
      component: <ButtonPrimaryDemo />
    },
    {
      title: t('variants.secondary'),
      description: t('variants.secondaryDescription'),
      component: <ButtonSecondaryDemo />
    },
    {
      title: t('variants.destructive'),
      description: t('variants.destructiveDescription'),
      component: <ButtonDestructiveDemo />
    },
    {
      title: t('variants.outline'),
      description: t('variants.outlineDescription'),
      component: <ButtonOutlineDemo />
    },
    {
      title: t('variants.icon'),
      description: t('variants.iconDescription'),
      component: <ButtonIconDemo />
    },
    {
      title: t('variants.loading'),
      description: t('variants.loadingDescription'),
      component: <ButtonLoadingDemo />
    },
    {
      title: t('variants.split'),
      description: t('variants.splitDescription'),
      component: <ButtonSplitDemo />
    },
    {
      title: t('variants.ghost'),
      description: t('variants.ghostDescription'),
      component: <ButtonGhostDemo />
    },
    {
      title: t('variants.gradient'),
      description: t('variants.gradientDescription'),
      component: <ButtonGradientDemo />
    },
    {
      title: t('variants.link'),
      description: t('variants.linkDescription'),
      component: <ButtonLinkDemo />
    },
    {
      title: t('variants.social'),
      description: t('variants.socialDescription'),
      component: <ButtonSocialDemo />
    },
    {
      title: t('variants.socialLogin'),
      description: t('variants.socialLoginDescription'),
      component: <ButtonSocialLoginDemo />
    },
    {
      title: t('variants.neon'),
      description: t('variants.neonDescription'),
      component: <ButtonNeonDemo />
    },
    {
      title: t('variants.rounded'),
      description: t('variants.roundedDescription'),
      component: <ButtonRoundedDemo />
    },
    {
      title: t('variants.toggle'),
      description: t('variants.toggleDescription'),
      component: <ButtonToggleDemo />
    },
    {
      title: t('variants.themeToggle'),
      description: t('variants.themeToggleDescription'),
      component: <ButtonThemeToggleDemo />
    },
    {
      title: t('variants.fullWidth'),
      description: t('variants.fullWidthDescription'),
      component: <ButtonFullWidthDemo />
    },
    {
      title: t('variants.group'),
      description: t('variants.groupDescription'),
      component: <ButtonGroupDemo />
    },
    {
      title: t('variants.group2'),
      description: t('variants.group2Description'),
      component: <ButtonGroup2Demo />
    },
    {
      title: t('variants.copy'),
      description: t('variants.copyDescription'),
      component: <ButtonCopyDemo />
    },
    {
      title: t('variants.withBadge'),
      description: t('variants.withBadgeDescription'),
      component: <ButtonWithBadgeDemo />
    },
    {
      title: t('variants.withTooltip'),
      description: t('variants.withTooltipDescription'),
      component: <ButtonWithTooltipDemo />
    },
    {
      title: t('variants.withTapAnimation'),
      description: t('variants.withTapAnimationDescription'),
      component: <ButtonWithTapAnimationDemo />
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
