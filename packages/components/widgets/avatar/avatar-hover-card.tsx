import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AvatarHoverCardDemo() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-center space-x-4">
      <HoverCard>
        <HoverCardTrigger className="cursor-pointer">
          <Avatar>
            <AvatarImage src="https://github.com/probo.png" alt="@probo" />
            <AvatarFallback>{t('fallback')}</AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="w-full max-w-xs">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/probo.png" alt="@probo" />
              <AvatarFallback>{t('fallback')}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{t('hoverCard.username')}</h4>
              <p className="text-sm">
                {t('hoverCard.description')}
              </p>
              <div className="flex items-center pt-2">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  {t('hoverCard.joinedDate')}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
