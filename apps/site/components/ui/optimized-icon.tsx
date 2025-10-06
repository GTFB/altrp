import { LucideIcon } from "lucide-react";
import { memo } from "react";

interface OptimizedIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  "aria-label"?: string;
}

export const OptimizedIcon = memo<OptimizedIconProps>(({ 
  icon: Icon, 
  className = "", 
  size = 24,
  "aria-label": ariaLabel 
}) => {
  return (
    <Icon 
      className={className} 
      size={size}
      aria-label={ariaLabel}
      role="img"
    />
  );
});

OptimizedIcon.displayName = "OptimizedIcon";
