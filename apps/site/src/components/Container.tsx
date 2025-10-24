import { LAYOUT_CONFIG } from "@/settings";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { containerWidth } = LAYOUT_CONFIG;

  return (
    <div
      className={`mx-auto px-4 ${className}`}
      style={{ maxWidth: containerWidth, width: '100%' }}
    >
      {children}
    </div>
  );
}
