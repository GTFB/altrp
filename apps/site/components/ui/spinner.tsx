import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return <Loader2Icon className={cn("animate-spin", className)} />;
};
