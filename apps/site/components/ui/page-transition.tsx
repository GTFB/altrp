"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div 
      className={isTransitioning ? 'opacity-50' : 'opacity-100'}
      style={{
        transition: 'opacity 0.1s ease-in-out'
      }}
    >
      {children}
    </div>
  );
};