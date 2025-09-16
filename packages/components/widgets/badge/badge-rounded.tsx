import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function BadgeRoundedDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center space-x-2">
      <Badge className="rounded-full">{t('variants.rounded')}</Badge>
      <Badge variant="secondary" className="rounded-full">{t('variants.secondary')}</Badge>
      <Badge variant="outline" className="rounded-full">{t('variants.outline')}</Badge>
    </div>
  );
}
