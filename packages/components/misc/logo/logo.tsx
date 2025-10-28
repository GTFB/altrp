import { PROJECT_SETTINGS } from "@/settings";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/images/logo.svg" 
        alt="Sun Day Logo" 
        width={90} 
        height={32}
        className="-mt-4 w-40 h-auto"
      />
    </div>
  );
}
