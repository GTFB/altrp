import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import CodeExample from "./code-example";

interface ComponentLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  showCodeExample?: boolean;
  codeExample?: string;
}

export default function ComponentLayout({
  title,
  description,
  children,
  className,
  showCodeExample = false,
  codeExample
}: ComponentLayoutProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {children}
      </div>

      {/* Code Example */}
      {showCodeExample && codeExample && (
        <CodeExample>{codeExample}</CodeExample>
      )}
    </div>
  );
}
