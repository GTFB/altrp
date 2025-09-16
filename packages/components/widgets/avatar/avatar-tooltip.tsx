import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export default function AvatarWithTooltipDemo() {
  const t = useTranslations('demo.avatar');

  return (
    <div className="flex items-center space-x-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src="https://github.com/probo.png" alt="@probo" />
            <AvatarFallback>{t('fallback')}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="font-semibold">
          <p>{t('tooltip.probo')}</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="font-semibold">
          <p>{t('tooltip.vercel')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
