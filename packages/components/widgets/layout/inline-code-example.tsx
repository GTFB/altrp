import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InlineCodeExampleProps {
  children: ReactNode;
  className?: string;
}

export default function InlineCodeExample({
  children,
  className
}: InlineCodeExampleProps) {
  return (
    <div className={cn("mt-4", className)}>
      <div className="bg-muted p-4 rounded-lg border text-sm">
        <pre className="overflow-x-auto">
          <code className="text-foreground">{children}</code>
        </pre>
      </div>
    </div>
  );
}
