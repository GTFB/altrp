'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Upload, X, Image as ImageIcon, Loader2, Search, Check } from 'lucide-react';
import Image from 'next/image';
import path from 'path';

interface Media {
  slug: string;
  title: string;
  url: string;
  alt?: string;
  type?: 'image' | 'video' | 'document' | 'audio';
}

interface MediaUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MediaUpload({ value, onChange, disabled = false }: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preview when value changes
  React.useEffect(() => {
    if (value) {
      // Find the media item to get the full URL with extension
      const mediaItem = mediaList.find(media => media.slug === value);
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

  // Load media list when popover opens
  const loadMediaList = useCallback(async () => {
    setIsLoadingMedia(true);
    try {
      const response = await fetch('/api/admin/media');
      const data = await response.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (error) {
      console.error('Error loading media list:', error);
    } finally {
      setIsLoadingMedia(false);
    }
  }, []);

  // Load media list on component mount to ensure we have the data
  useEffect(() => {
    loadMediaList();
  }, [loadMediaList]);

  // Load media when popover opens
  useEffect(() => {
    if (isPopoverOpen) {
      loadMediaList();
    }
  }, [isPopoverOpen, loadMediaList]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));

      // Upload file
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload error');
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
      console.error('Error uploading file:', error);
      alert('File upload error');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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


  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleMediaSelect = (media: Media | null) => {
    onChange(media ? media.slug : '');
    setIsPopoverOpen(false);
  };

  const filteredMedia = mediaList.filter(media => 
    media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    media.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showNoneOption = !searchQuery || 'none'.includes(searchQuery.toLowerCase());

  return (
    <div className="space-y-2">
      <Label htmlFor="media-upload">Media File</Label>
      
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors hover:bg-muted/50
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${preview ? 'border-primary' : 'border-muted-foreground/25'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={disabled ? undefined : () => setIsPopoverOpen(true)}
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
            <p className="text-sm text-muted-foreground">Uploading file...</p>
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
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
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
                  onChange(''); // Clear the form value
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
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {isLoadingMedia ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredMedia.length === 0 && !showNoneOption ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No media found' : 'No media available'}
              </div>
            ) : (
              <div className="p-2">
                {/* None option */}
                {showNoneOption && (
                  <div
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleMediaSelect(null)}
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                      <X className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">None</p>
                      <p className="text-xs text-muted-foreground">No media selected</p>
                    </div>
                    {!value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                )}
                
                {/* Media items */}
                {filteredMedia.map((media) => (
                  <div
                    key={media.slug}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleMediaSelect(media)}
                  >
                                            <div className="relative w-12 h-12 flex-shrink-0">
                          {media.type === 'image' ? (
                            <div className="w-full h-full rounded overflow-hidden bg-muted flex items-center justify-center">
                              <Image
                                src={media.url}
                                alt={media.alt || media.title}
                                width={48}
                                height={48}
                                className="object-contain"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-muted rounded flex items-center justify-center"><svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{media.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{path.basename(media.url)}</p>
                    </div>
                    {value === media.slug && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsPopoverOpen(false);
                openFileDialog();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New File
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {value && (
        <div className="flex items-center space-x-2">
          <Input
            value={(() => {
              const mediaItem = mediaList.find(media => media.slug === value);
              if (mediaItem) {
                return path.basename(mediaItem.url);
              }
              // If no media item found, show the value as is (which now includes extension)
              return value;
            })()}
            readOnly
            className="text-sm"
            placeholder="File name"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPopoverOpen(true)}
            disabled={disabled}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      )}

    </div>
  );
}
