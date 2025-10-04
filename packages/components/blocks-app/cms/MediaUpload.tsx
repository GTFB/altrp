"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import path from "path";
import { MediaSelectorPopover } from "./MediaSelectorPopover";

interface Media {
  slug: string;
  title: string;
  url: string;
  alt?: string;
  type?: "image" | "video" | "document" | "audio";
}

interface MediaUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MediaUpload({
  value,
  onChange,
  disabled = false,
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLInputElement>(null);

  // Load preview when value changes
  React.useEffect(() => {
    if (value) {
      // Find the media item to get the full URL with extension
      const mediaItem = mediaList.find((media) => media.slug === value);
      if (mediaItem) {
        setPreview(mediaItem.url);
      } else {
        // Fallback: try to construct URL with extension
        setPreview(`/images/${value}`);
      }
    } else {
      setPreview(null);
    }
  }, [value, mediaList]);

  // Load media list on component mount to ensure we have the data
  const loadMediaList = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/media");
      const data = await response.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (error) {
      console.error("Error loading media list:", error);
    }
  }, []);

  useEffect(() => {
    loadMediaList();
  }, [loadMediaList]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      console.log("MediaUpload: handleFileSelect called with file:", file.name);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setIsUploading(true);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("alt", file.name.replace(/\.[^/.]+$/, ""));

        // Upload file
        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("File upload error");
        }

        const result = await response.json();
        const fileName = result.fileName; // This will be the filename with extension
        const fullFileName = result.fullFileName; // This will be the filename with extension

        onChange(fileName);

        // Set preview immediately with full filename
        if (fullFileName) {
          setPreview(`/images/${fullFileName}`);
        }

        // Reload media list to get the new item with full URL
        await loadMediaList();
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("File upload error");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, loadMediaList],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadButtonClick = () => {
    uploadButtonRef.current?.click();
  };

  const handleUploadButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="media-upload">Media File</Label>

      <MediaSelectorPopover
        value={value}
        onChange={onChange}
        disabled={disabled}
        onUpload={handleFileSelect}
        trigger={
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors hover:bg-muted/50
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${preview ? "border-primary" : "border-muted-foreground/25"}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
            />

            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Uploading file...
                </p>
              </div>
            ) : preview ? (
              <div className="relative">
                <div className="w-full h-[150px] flex items-center justify-center bg-muted rounded-lg">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="max-h-[150px] max-w-full object-contain"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="w-full h-full flex items-center justify-center"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }
                    }}
                  />
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(""); // Clear the form value
                      setPreview(null); // Clear the preview
                    }}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Click to select media</p>
                  <p className="text-xs text-muted-foreground">
                    or drag and drop file here
                  </p>
                </div>
              </div>
            )}
          </div>
        }
      />

      {value && (
        <div className="flex items-center space-x-2 ">
          <MediaSelectorPopover
            value={value}
            onChange={onChange}
            disabled={disabled}
            onUpload={handleFileSelect}
            className="flex-grow"
            trigger={
              <Input
                value={(() => {
                  const mediaItem = mediaList.find(
                    (media) => media.slug === value,
                  );
                  if (mediaItem) {
                    return path.basename(mediaItem.url);
                  }
                  // If no media item found, show the value as is (which now includes extension)
                  return value;
                })()}
                readOnly
                className="flex-1 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                placeholder="File name"
              />
            }
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="flex-shrink-0"
            onClick={handleUploadButtonClick}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Hidden input for upload button */}
      <input
        ref={uploadButtonRef}
        type="file"
        accept="image/*"
        onChange={handleUploadButtonChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
