"use client";

import { useEffect } from "react";

export const ResourceOptimizer = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = () => {
      // Preload critical images
      const criticalImages = [
        "/images/tanya.png",
        "/images/element.svg",
        "/images/logo.svg",
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        link.type = src.endsWith(".svg") ? "image/svg+xml" : "image/png";
        document.head.appendChild(link);
      });

      // Preload critical fonts
      const fontLinks = [
        {
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
          as: "style",
        },
        {
          href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
          as: "style",
        },
      ];

      fontLinks.forEach(({ href, as }) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = as;
        link.href = href;
        document.head.appendChild(link);
      });
    };

    // Load non-critical resources after initial load
    const loadNonCriticalResources = () => {
      // Load additional images that are not above the fold
      const nonCriticalImages = [
        "/images/1.jpg",
        "/images/2.jpg",
        "/images/3.jpg",
        "/images/4.jpg",
        "/images/5.jpg",
        "/images/6.jpg",
      ];

      nonCriticalImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    // Execute preloading immediately
    preloadResources();

    // Load non-critical resources after a delay
    const timeoutId = setTimeout(loadNonCriticalResources, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
};
