"use client";

import { useEffect, useState } from "react";

export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQueryList.matches);

    updateMatch();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", updateMatch);
      return () => mediaQueryList.removeEventListener("change", updateMatch);
    } else {
      // Older Safari
      // @ts-ignore
      mediaQueryList.addListener(updateMatch);
      return () => {
        // @ts-ignore
        mediaQueryList.removeListener(updateMatch);
      };
    }
  }, [query]);

  return matches;
}


