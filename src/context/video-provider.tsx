"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { VideoPlayer } from "@/components/video-player";

type VideoContextType = {
  videoId: string | null;
  setVideoId: (id: string | null) => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [videoId, setVideoId] = useState<string | null>(null);

  return (
    <VideoContext.Provider value={{ videoId, setVideoId }}>
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
