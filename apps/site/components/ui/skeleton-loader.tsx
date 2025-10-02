"use client";

import { useEffect, useState } from "react";

interface SkeletonLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const SkeletonLoader = ({ 
  children, 
  fallback, 
  delay = 0 
}: SkeletonLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) {
    return (
      fallback || (
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded h-4 w-full mb-2"></div>
          <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
          <div className="bg-gray-200 rounded h-4 w-1/2"></div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

// Skeleton for Hero section
export const HeroSkeleton = () => (
  <div className="h-100 sm:h-260 md:h-260 lg:h-160 flex items-center justify-center bg-red-900 rounded-3xl relative min-h-screen sm:min-h-0 overflow-hidden">
    <div className="max-w-(--breakpoint-xl) w-full mx-auto grid lg:grid-cols-2 px-3 sm:px-1 relative z-10 h-full">
      <div className="flex flex-col justify-center text-center lg:text-left">
        <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-1 sm:gap-2">
          <div className="bg-white/10 border border-white/30 rounded-full h-6 w-16 animate-pulse"></div>
          <div className="bg-white/10 border border-white/30 rounded-full h-6 w-12 animate-pulse"></div>
          <div className="bg-white/10 border border-white/30 rounded-full h-6 w-14 animate-pulse"></div>
        </div>
        <div className="mt-6 h-12 bg-white/20 rounded animate-pulse"></div>
        <div className="mt-6 h-6 bg-white/20 rounded animate-pulse"></div>
        <div className="mt-12 h-12 bg-red-500 rounded-full w-48 mx-auto lg:mx-0 animate-pulse"></div>
      </div>
      <div className="w-full h-70 sm:h-150 relative rounded-xl bg-gray-300 animate-pulse"></div>
    </div>
  </div>
);
