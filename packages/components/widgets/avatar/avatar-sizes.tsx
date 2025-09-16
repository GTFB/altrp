import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export default function AvatarSizeDemo() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-8">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
      <Avatar className="size-10">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
      <Avatar className="size-11">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
      <Avatar className="size-14">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
    </div>
  );
}
