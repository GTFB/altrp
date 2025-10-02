"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

export const ToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Memoize thresholds for performance
  const scrollThresholds = useMemo(() => ({
    home: 300, // Fixed threshold for home page
    other: 400, // Fixed threshold for other pages
  }), []);

  // Optimized visibility check function with throttling
  const toggleVisibility = useCallback(() => {
    const scrollY = window.pageYOffset;
    const threshold = pathname === '/' ? scrollThresholds.home : scrollThresholds.other;
    
    const shouldShow = scrollY > threshold;
    
    // Update state only if it has changed
    setIsVisible(prev => prev !== shouldShow ? shouldShow : prev);
  }, [pathname, scrollThresholds]);

  // Throttled scroll handler for performance
  useEffect(() => {
    let ticking = false;
    
    const throttledToggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check visibility immediately
    toggleVisibility();

    window.addEventListener("scroll", throttledToggleVisibility, { passive: true });
    window.addEventListener("resize", throttledToggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", throttledToggleVisibility);
      window.removeEventListener("resize", throttledToggleVisibility);
    };
  }, [toggleVisibility]);

  // Memoized scroll function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Memoized styles for performance
  const buttonStyles = useMemo(() => ({
    bottom: "20px",
    right: "20px",
  }), []);

  // Early return for performance
  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 will-change-transform"
      style={buttonStyles}
      aria-label="Back to top"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  );
};
