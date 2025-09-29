import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AvatarWithTooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent className="font-semibold">shadcn</TooltipContent>
    </Tooltip>
  );
}
