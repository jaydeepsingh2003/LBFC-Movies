
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { VideoPlayer } from "@/components/video-player";

export type MediaState = {
  type: 'youtube' | 'movie' | 'tv';
  id: string | number;
  title?: string;
  posterPath?: string | null;
  season?: number;
  episode?: number;
} | null;

type VideoContextType = {
  activeMedia: MediaState;
  setActiveMedia: (media: MediaState) => void;
  // Keep setVideoId for backward compatibility with trailers
  setVideoId: (id: string | null) => void;
  videoId: string | null;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [activeMedia, setActiveMedia] = useState<MediaState>(null);

  const setVideoId = (id: string | null) => {
    if (id) {
      setActiveMedia({ type: 'youtube', id });
    } else {
      setActiveMedia(null);
    }
  };

  const videoId = activeMedia?.type === 'youtube' ? activeMedia.id as string : null;

  return (
    <VideoContext.Provider value={{ activeMedia, setActiveMedia, setVideoId, videoId }}>
      {children}
      <VideoPlayer />
    </VideoContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return context;
}
