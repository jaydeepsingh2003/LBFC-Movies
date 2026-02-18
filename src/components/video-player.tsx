
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";
import { X } from "lucide-react";

export function VideoPlayer() {
  const { activeMedia, setActiveMedia } = useVideoPlayer();

  const isOpen = !!activeMedia;
  const onClose = () => setActiveMedia(null);

  const renderContent = () => {
    if (!activeMedia) return null;

    if (activeMedia.type === 'youtube') {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${activeMedia.id}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    if (activeMedia.type === 'movie') {
      // VidLink Movie Format: https://vidlink.pro/movie/{tmdbId}
      // Parameters: primaryColor=e11d48 (App Red), nextbutton=true, autoplay=true
      const url = `https://vidlink.pro/movie/${activeMedia.id}?primaryColor=e11d48&secondaryColor=171717&iconColor=ffffff&autoplay=true&nextbutton=true`;
      return (
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    if (activeMedia.type === 'tv') {
      // VidLink TV Format: https://vidlink.pro/tv/{tmdbId}/{season}/{episode}
      const season = activeMedia.season || 1;
      const episode = activeMedia.episode || 1;
      const url = `https://vidlink.pro/tv/${activeMedia.id}/${season}/${episode}?primaryColor=e11d48&secondaryColor=171717&iconColor=ffffff&autoplay=true&nextbutton=true`;
      return (
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-6xl aspect-video p-0 border-none bg-black/90 backdrop-blur-3xl overflow-hidden rounded-2xl md:rounded-[2rem]">
        <DialogTitle className="sr-only">Studio Player</DialogTitle>
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 md:-right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white z-[100]"
        >
            <X className="size-6" />
        </button>
        <div className="w-full h-full">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
