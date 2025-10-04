import { useState, useCallback } from "react";

interface UseSlugValidationOptions {
  currentSlug?: string; // For edit mode
  debounceMs?: number;
}

export function useSlugValidation(options: UseSlugValidationOptions = {}) {
  const { currentSlug, debounceMs = 500 } = options;
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetValidation = useCallback(() => {
    setIsValid(true);
    setError(null);
    setIsChecking(false);
  }, []);

  const checkSlug = useCallback(
    async (slug: string) => {
      if (!slug) {
        setIsValid(true);
        setError(null);
        return;
      }

      // If we're editing and the slug hasn't changed, it's valid
      if (currentSlug && slug === currentSlug) {
        setIsValid(true);
        setError(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const params = new URLSearchParams({ slug });
        if (currentSlug) {
          params.append("currentSlug", currentSlug);
        }

        const response = await fetch(`/api/admin/pages/check-slug?${params}`);
        const data = await response.json();

        if (response.ok) {
          setIsValid(data.available);
          setError(data.available ? null : data.error);
        } else {
          setIsValid(false);
          setError(data.error || "Failed to check slug");
        }
      } catch {
        setIsValid(false);
        setError("Network error");
      } finally {
        setIsChecking(false);
      }
    },
    [currentSlug],
  );

  const debouncedCheckSlug = useCallback(debounce(checkSlug, debounceMs), [
    checkSlug,
    debounceMs,
  ]);

  return {
    isValid,
    error,
    isChecking,
    checkSlug: debouncedCheckSlug,
    resetValidation,
  };
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
