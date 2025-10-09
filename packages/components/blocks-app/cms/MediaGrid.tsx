"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { MediaCard } from "./MediaCard";
import { MediaEditPopup } from "./MediaEditPopup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare, Square } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  description?: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

interface MediaGridProps {
  refreshTrigger?: number;
}

export function MediaGrid({ refreshTrigger }: MediaGridProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  const loadMedia = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/media?page=${pageNum}&limit=18`);

      if (!response.ok) {
        throw new Error("Failed to load media");
      }

      const data = await response.json();

      if (reset) {
        setMedia(data.media);
      } else {
        setMedia((prev) => [...prev, ...data.media]);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load media on mount and when refreshTrigger changes (18 items per page)
  useEffect(() => {
    setPage(1);
    setMedia([]);
    loadMedia(1, true);
  }, [refreshTrigger, loadMedia]);

  // Load next page on scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMedia(nextPage, false);
    }
  }, [inView, hasMore, loading, page, loadMedia]);

  const handleMediaSelect = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const handleMediaUpdate = (updatedMedia: MediaItem) => {
    setMedia((prev) =>
      prev.map((item) => (item.id === updatedMedia.id ? updatedMedia : item)),
    );
    setSelectedMedia(null);
  };

  const handleMediaDelete = (mediaId: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== mediaId));
    setSelectedMedia(null);
  };

  const handleSelectMedia = (mediaId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(mediaId);
      } else {
        newSet.delete(mediaId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(media.map((item) => item.id));
    const isAllSelected =
      media.length > 0 && media.every((item) => selectedIds.has(item.id));

    if (isAllSelected) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} selected media files?`,
      )
    ) {
      return;
    }

    try {
      // Delete each selected media
      for (const mediaId of selectedIds) {
        const response = await fetch(`/api/admin/media/${mediaId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete media ${mediaId}`);
        }
      }

      // Remove from local state
      setMedia((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());

      // Close popup if selected media was deleted
      if (selectedMedia && selectedIds.has(selectedMedia.id)) {
        setSelectedMedia(null);
      }
    } catch (error) {
      console.error("Error deleting selected media:", error);
    }
  };

  if (loading && media.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No media files found</p>
      </div>
    );
  }

  const isAllSelected =
    media.length > 0 && media.every((item) => selectedIds.has(item.id));
  const hasSelection = selectedIds.size > 0;

  return (
    <>
      {/* Action buttons */}
      <div className="sticky top-8 z-20 bg-background/95 backdrop-blur-sm border-b mb-4 p-4 -mx-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleSelectAll}
          disabled={media.length === 0}
          className="flex items-center gap-2"
        >
          {isAllSelected ? (
            <>
              <Square className="h-4 w-4" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4" />
              Select All
            </>
          )}
        </Button>

        {hasSelection && (
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onClick={() => handleMediaSelect(item)}
            isSelected={selectedIds.has(item.id)}
            onSelect={handleSelectMedia}
          />
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {loading && media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      )}

      {/* Intersection observer trigger */}
      <div ref={ref} className="h-4" />

      {/* Media Edit Popup */}
      {selectedMedia && (
        <MediaEditPopup
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onUpdate={handleMediaUpdate}
          onDelete={handleMediaDelete}
        />
      )}
    </>
  );
}
