"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  url: string
  alt?: string
  title?: string
  description?: string
  filename: string
  size: number
  mimeType: string
  createdAt: string
}

interface MediaCardProps {
  media: MediaItem
  onClick: () => void
  isSelected?: boolean
  onSelect?: (mediaId: string, selected: boolean) => void
}

export function MediaCard({ media, onClick, isSelected = false, onSelect }: MediaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(media.id, checked)
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
        "border-0 shadow-sm bg-card",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          {!imageError ? (
            <img
              src={media.url}
              alt={media.alt || media.filename}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-200",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-2">📷</div>
                <div className="text-xs">Failed to load</div>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Checkbox */}
          <div className="absolute top-2 right-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 border-white/90"
            />
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

          {/* File info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="text-white text-xs">
              <div className="font-medium truncate">{media.filename}</div>
              <div className="text-white/70">{formatFileSize(media.size)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
