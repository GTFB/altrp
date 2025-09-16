import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function BadgeDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center space-x-2">
      <Badge>{t('variants.default')}</Badge>
      <Badge variant="secondary">{t('variants.secondary')}</Badge>
      <Badge variant="outline">{t('variants.outline')}</Badge>
      <Badge variant="destructive">{t('variants.destructive')}</Badge>
    </div>
  );
}
