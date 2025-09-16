import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export default function AvatarRing() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-center gap-4">
      <Avatar className="ring-2 ring-ring ring-offset-2 ring-offset-background">
        <AvatarImage src="https://github.com/probo.png" alt="@probo" />
        <AvatarFallback className="rounded-none">ER</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-green-500 ring-offset-2 ring-offset-background">
        <AvatarImage src="https://github.com/leerob.png" alt="@evilrabbit" />
        <AvatarFallback className="rounded-md">LR</AvatarFallback>
      </Avatar>
      <div className="bg-gradient-to-b from-red-500 to-blue-500 rounded-full p-1">
        <Avatar className="ring-2 ring-background">
          <AvatarImage
            src="https://github.com/evilrabbit.png"
            alt="@evilrabbit"
          />
          <AvatarFallback>{t('fallback')}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
