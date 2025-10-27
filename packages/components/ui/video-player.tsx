"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  type: "youtube" | "vk" | "direct";
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
}

export function VideoPlayer({
  src,
  type,
  title,
  className,
  autoPlay = false,
  muted = false,
  controls = true,
  width = "100%",
  height = "auto",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Generate embed URLs based on type
  const getEmbedUrl = (url: string, type: string) => {
    if (type === "youtube") {
      const videoId = extractYouTubeId(url);
      if (!videoId) return url;
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
    }

    if (type === "vk") {
      const videoId = extractVKId(url);
      if (!videoId) return url;
      return `https://vk.com/video_ext.php?oid=${videoId.ownerId}&id=${videoId.videoId}&hd=1&autoplay=${autoPlay ? 1 : 0}`;
    }

    return url;
  };

  // Extract YouTube video ID
  const extractYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract VK video ID
  const extractVKId = (url: string) => {
    const regExp = /vk\.com\/video(-?\d+_\d+)/;
    const match = url.match(regExp);
    if (match) {
      const [ownerId, videoId] = match[1].split("_");
      return { ownerId, videoId };
    }
    return null;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (type === "direct" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (type === "direct" && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (type === "direct" && videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle duration change
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle external link
  const openExternal = () => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Render different player types
  if (type === "youtube" || type === "vk") {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-black rounded-lg overflow-hidden",
          className,
        )}
        style={{ width, height: height === "auto" ? "315px" : height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        <iframe
          src={getEmbedUrl(src, type)}
          title={title || "Video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Overlay controls for external videos */}
        <div
          className={cn(
            "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={openExternal}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in {type === "youtube" ? "YouTube" : "VK"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Direct video player
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-black rounded-lg overflow-hidden group",
        className,
      )}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
        autoPlay={autoPlay}
        playsInline
      />

      {/* Custom controls overlay */}
      {controls && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0",
          )}
        >
          {/* Progress bar */}
          <div className="px-4 pb-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS for custom slider (add to your global CSS)
// const sliderStyles = `
// .slider::-webkit-slider-thumb {
//   appearance: none;
//   width: 16px;
//   height: 16px;
//   border-radius: 50%;
//   background: #ffffff;
//   cursor: pointer;
// }

// .slider::-moz-range-thumb {
//   width: 16px;
//   height: 16px;
//   border-radius: 50%;
//   background: #ffffff;
//   cursor: pointer;
//   border: none;
// }
// `

export default VideoPlayer;
