import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function BadgeGradientOutlineDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center space-x-2">
      <div className="bg-gradient-to-r from-sky-400 to-indigo-600 rounded-full p-0.5 flex items-center justify-center">
        <Badge className="bg-background text-foreground rounded-full border-none">
          {t('variants.gradientOutline')}
        </Badge>
      </div>
      <div className="bg-gradient-to-r from-purple-400 to-pink-600 rounded-full p-0.5 flex items-center justify-center">
        <Badge className="bg-background text-foreground rounded-full border-none">
          {t('variants.purpleOutline')}
        </Badge>
      </div>
    </div>
  );
}
