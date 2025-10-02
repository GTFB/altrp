"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const LazyImage = ({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  quality = 75,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={imgRef} className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          sizes={sizes}
          quality={quality}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading={priority ? "eager" : "lazy"}
        />
      )}
      {hasError && (
        <div className={`${fill ? 'absolute inset-0' : 'w-full h-full'} bg-gray-300 flex items-center justify-center text-gray-500 text-sm`}>
          Image not found
        </div>
      )}
      {!isLoaded && !hasError && (
        <div className={`${fill ? 'absolute inset-0' : 'w-full h-full'} bg-gray-200 animate-pulse rounded`} />
      )}
    </div>
  );
};
