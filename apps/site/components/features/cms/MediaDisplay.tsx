'use client';

import React from 'react';
import Image from 'next/image';

interface Media {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
  alt?: string;
  type?: 'image' | 'video' | 'document' | 'audio';
  size?: number;
}

interface MediaDisplayProps {
  media: Media;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  showDescription?: boolean;
  showTitle?: boolean;
}

export function MediaDisplay({ 
  media, 
  className = '', 
  priority = false,
  sizes,
  fill = false,
  width,
  height,
  showDescription = true,
  showTitle = false
}: MediaDisplayProps) {
  // Don't render if media type is not image
  if (media.type && media.type !== 'image') {
    return null;
  }

  const imageProps = {
    src: media.url,
    alt: media.alt || media.title || 'Media image',
    title: media.title,
    priority,
    className: `object-cover ${className}`,
    ...(fill ? { fill: true } : { width: width || 800, height: height || 600 }),
    ...(sizes && { sizes }),
  };

  return (
    <div className="media-display">
      <Image {...imageProps} />
      {(showTitle && media.title) && (
        <h3 className="text-lg font-semibold mt-3">
          {media.title}
        </h3>
      )}
      {(showDescription && media.description) && (
        <p className="text-sm text-muted-foreground mt-2">
          {media.description}
        </p>
      )}
    </div>
  );
}
