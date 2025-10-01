import { ComponentsHeader } from "@/components/misc/components-header";
import { ToTopButton } from "@/components/misc/to-top-button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_SETTINGS } from "@/settings";
import { useTranslations } from "next-intl";
import { cardStyles } from "@/lib/button-styles";
import {
  AvatarDemo,
  ClickableAvatarDemo,
  AvatarWithTooltipDemo,
  AvatarWithTextDemo,
  AvatarHoverCardDemo,
  AvatarSizeDemo,
  AvatarFallbackDemo,
  AvatarColorDemo,
  AvatarShapeDemo,
  AvatarRing,
  AvatarWithStatusDemo,
  AvatarBadge,
  AvatarGroupDemo,
  AvatarGroupMaxAvatarDemo
} from "@/components/widgets/avatar";

export default function AvatarPage() {
  const t = useTranslations('demo.avatar');

  const demoSections = [
    {
      title: t('variants.default.title'),
      description: t('variants.default.description'),
      component: <AvatarDemo />
    },
    {
      title: t('variants.clickable.title'),
      description: t('variants.clickable.description'),
      component: <ClickableAvatarDemo />
    },
    {
      title: t('variants.tooltip.title'),
      description: t('variants.tooltip.description'),
      component: <AvatarWithTooltipDemo />
    },
    {
      title: t('variants.withText.title'),
      description: t('variants.withText.description'),
      component: <AvatarWithTextDemo />
    },
    {
      title: t('variants.hoverCard.title'),
      description: t('variants.hoverCard.description'),
      component: <AvatarHoverCardDemo />
    },
    {
      title: t('variants.sizes.title'),
      description: t('variants.sizes.description'),
      component: <AvatarSizeDemo />
    },
    {
      title: t('variants.fallback.title'),
      description: t('variants.fallback.description'),
      component: <AvatarFallbackDemo />
    },
    {
      title: t('variants.colors.title'),
      description: t('variants.colors.description'),
      component: <AvatarColorDemo />
    },
    {
      title: t('variants.shapes.title'),
      description: t('variants.shapes.description'),
      component: <AvatarShapeDemo />
    },
    {
      title: t('variants.ring.title'),
      description: t('variants.ring.description'),
      component: <AvatarRing />
    },
    {
      title: t('variants.status.title'),
      description: t('variants.status.description'),
      component: <AvatarWithStatusDemo />
    },
    {
      title: t('variants.badge.title'),
      description: t('variants.badge.description'),
      component: <AvatarBadge />
    },
    {
      title: t('variants.group.title'),
      description: t('variants.group.description'),
      component: <AvatarGroupDemo />
    },
    {
      title: t('variants.groupMax.title'),
      description: t('variants.groupMax.description'),
      component: <AvatarGroupMaxAvatarDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        description=""
        showBackButton={true}
        backHref="/components"
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
