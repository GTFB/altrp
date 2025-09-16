import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ClickableAvatarDemo() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-center space-x-4">
      <Link href="https://github.com/probo" target="_blank">
        <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src="https://github.com/probo.png" alt="@probo" />
          <AvatarFallback>{t('fallback')}</AvatarFallback>
        </Avatar>
      </Link>
      <Link href="https://github.com/vercel" target="_blank">
        <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
          <AvatarFallback>VC</AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}
