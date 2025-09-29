'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface MediaSelectorPopoverProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  trigger?: React.ReactNode;
  placeholder?: string;
  showUploadButton?: boolean;
  onUpload?: (file: File) => void;
  className?: string;
}

export function MediaSelectorPopover({ 
  value, 
  onChange, 
  disabled = false, 
  trigger,
  placeholder = "Select media...",
  showUploadButton = true,
  onUpload,
  className = '',
}: MediaSelectorPopoverProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load media when popover opens
  useEffect(() => {
    if (isPopoverOpen) {
      loadMediaList();
    }
  }, [isPopoverOpen, loadMediaList]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    console.log('MediaSelectorPopover: handleFileSelect called with file:', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (onUpload) {
      console.log('MediaSelectorPopover: calling onUpload with file:', file.name);
      onUpload(file);
    } else {
      // Default upload behavior
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('File upload error');
        }

        const result = await response.json();
        const fileName = result.fileName;
        onChange(fileName);
        await loadMediaList();
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('File upload error');
      }
    }
  }, [onChange, onUpload, loadMediaList]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed, files:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type);
      handleFileSelect(file);
    } else {
      console.log('No file selected');
    }
  };

  const openFileDialog = () => {
    console.log('Opening file dialog, fileInputRef:', fileInputRef.current);
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

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="h-8 w-8 p-0"
      title={placeholder}
    >
      <ImageIcon className="h-4 w-4" />
    </Button>
  );

  console.log('MediaSelectorPopover render:', { isPopoverOpen, hasTrigger: !!trigger });

  return (
    <Popover open={isPopoverOpen} onOpenChange={(open) => {
      console.log('Popover state change:', open);
      setIsPopoverOpen(open);
    }}>
      <PopoverTrigger asChild>
        <div className={className}>
          {trigger || defaultTrigger}
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 z-[9999] bg-background border shadow-lg" 
        align="center"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={8}
      >
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
        
        {showUploadButton && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                console.log('Upload button clicked');
                setIsPopoverOpen(false);
                openFileDialog();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New File
            </Button>
          </div>
        )}

      </PopoverContent>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </Popover>
  );
}
