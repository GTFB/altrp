import { LAYOUT_CONFIG } from "@/settings";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { containerWidth = "1440px" } = LAYOUT_CONFIG;

  const containerWidthClasses = `width-[${containerWidth}] max-width-[100%]`;
  return (
    <div
      className={`container mx-auto px-4 ${containerWidthClasses} ${className}`}
    >
      {children}
    </div>
  );
}
