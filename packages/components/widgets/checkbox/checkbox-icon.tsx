"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { BookmarkIcon, CheckIcon, Heart, StarIcon } from "lucide-react";

// Custom Checkbox component with icon support
const IconCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    icon?: React.ReactNode;
    checkedIcon?: React.ReactNode;
  }
>(({ className, icon, checkedIcon, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn("peer group h-4 w-4 shrink-0 rounded border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)}
    {...props}
  >
    <span className="group-data-[state=checked]:hidden">{icon}</span>
    <span className="group-data-[state=unchecked]:hidden">{checkedIcon}</span>

    {!checkedIcon && (
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    )}
  </CheckboxPrimitive.Root>
));
IconCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export default function CheckboxIconDemo() {
  return (
    <div className="flex items-center space-x-3">
      <IconCheckbox
        defaultChecked
        icon={<Heart />}
        checkedIcon={<Heart className="fill-rose-500 stroke-rose-500" />}
      />
      <IconCheckbox
        defaultChecked
        icon={<BookmarkIcon />}
        checkedIcon={<BookmarkIcon className="fill-primary" />}
      />
      <IconCheckbox
        icon={<StarIcon />}
        defaultChecked
        checkedIcon={<StarIcon className="fill-yellow-400 stroke-yellow-400" />}
      />
    </div>
  );
}
