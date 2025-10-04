import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export function Icon({ icon: IconComponent, size = 24, className }: IconProps) {
  return (
    <IconComponent size={size} className={cn("inline-block", className)} />
  );
}
