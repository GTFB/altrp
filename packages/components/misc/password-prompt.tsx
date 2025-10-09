"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTranslations } from "@/hooks/use-translations";

interface PasswordPromptProps {
  sectionId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PasswordPrompt({
  sectionId,
  onSuccess,
  onCancel,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [groupInfo, setGroupInfo] = useState<string>("");
  const { setSessionData } = useAuth();
  const t = useTranslations();

  // Handle Escape key and background click
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // If no cancel handler, go back in browser history
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // If no history, reload the page to show password prompt again
        window.location.reload();
      }
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, sectionId }),
      });

      const data = await response.json();
      console.log("data", data);
      setSessionData(data);

      if (response.ok && data.success) {
        setGroupInfo(`${t("auth.accessGranted")} ${data.groupName}`);
        onSuccess();
      } else {
        setError(data.error || t("auth.authenticationFailed"));
      }
    } catch {
      setError(t("auth.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
      onClick={handleBackgroundClick}
    >
      <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("auth.protectedContent")}</CardTitle>
          <CardDescription>
            {t("auth.passwordProtected")}
            {groupInfo && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                {groupInfo}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("common.password")}
              </label>
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("common.enterPassword")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? t("common.verifying") : t("common.unlockContent")}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {t("common.cancel")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
