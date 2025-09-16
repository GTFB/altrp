import { badgeVariants } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function ClickableBadgeDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center space-x-2">
      <button
        className={badgeVariants({
          className: "cursor-pointer select-none focus:ring-offset-1",
        })}
      >
        {t('clickable.default')}
      </button>
      <button
        className={badgeVariants({
          variant: "secondary",
          className: "cursor-pointer select-none focus:ring-offset-1",
        })}
      >
        {t('clickable.secondary')}
      </button>
    </div>
  );
}
