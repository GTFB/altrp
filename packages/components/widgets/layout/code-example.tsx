import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CodeExampleProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function CodeExample({
  title = "Usage Example",
  children,
  className
}: CodeExampleProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-2xl font-semibold text-center">{title}</h2>
      <div className="bg-muted p-6 rounded-lg border">
        <pre className="text-sm overflow-x-auto">
          <code className="text-foreground">{children}</code>
        </pre>
      </div>
    </div>
  );
}
