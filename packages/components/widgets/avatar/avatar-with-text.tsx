import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export default function AvatarWithTextDemo() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-9">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="font-semibold tracking-tight leading-none">
          {t('text.name')}
        </span>
        <span className="leading-none text-sm text-muted-foreground">
          {t('text.description')}
        </span>
      </div>
    </div>
  );
}
