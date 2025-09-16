import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function BadgeGradientDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center space-x-2">
      <Badge className="rounded-full border-none bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
        {t('variants.gradient')}
      </Badge>
      <Badge className="rounded-full border-none bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        {t('variants.purple')}
      </Badge>
    </div>
  );
}
