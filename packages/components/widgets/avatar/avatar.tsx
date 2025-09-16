import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export default function AvatarDemo() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback>{t('fallback')}</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  );
}
