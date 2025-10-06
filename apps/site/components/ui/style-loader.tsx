"use client";

import { useEffect } from "react";

export const StyleLoader = () => {
  useEffect(() => {
    // Simple style loading without complex logic
    const loadStyles = () => {
      if (typeof window === 'undefined') return;
      
      // Simply show body after a small delay
      setTimeout(() => {
        document.body.classList.add('styles-loaded');
      }, 100);
    };

    loadStyles();
  }, []);

  return null;
};