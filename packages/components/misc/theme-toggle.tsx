"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

interface ThemeToggleProps {
  variant?: "default" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThemeToggle({
  variant = "default",
  size = "sm",
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("common");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`${sizeClasses[size]} p-0 border-0 focus:ring-0 focus:outline-none cursor-pointer hover:bg-muted hover:text-muted-foreground ${className}`}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`${sizeClasses[size]} px-2 border-0 focus:ring-0 focus:outline-none ${className}`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("dark")}</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("light")}</span>
        </>
      )}
    </Button>
  );
}
