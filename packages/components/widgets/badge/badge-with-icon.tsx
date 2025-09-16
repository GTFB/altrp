import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BadgeWithIconDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Badge className="rounded-full pl-1 gap-1.5">
        <ArrowLeftIcon className="h-4 w-4" />
        {t('withIcon.left')}
      </Badge>
      <Badge className="rounded-full pr-1 gap-1.5">
        {t('withIcon.right')}
        <ArrowRightIcon className="h-4 w-4" />
      </Badge>
      <Badge className="rounded-full pr-1 gap-1.5">
        {t('withIcon.remove')}
        <XIcon className="h-4 w-4" />
      </Badge>
    </div>
  );
}
