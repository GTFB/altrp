import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VariantDemoProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export default function VariantDemo({
  title,
  description,
  children,
  className
}: VariantDemoProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex justify-center">
        {children}
      </div>
    </section>
  );
}
