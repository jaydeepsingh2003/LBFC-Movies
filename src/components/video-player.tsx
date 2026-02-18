
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";
import { X, ShieldAlert } from "lucide-react";

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
      // VidLink JW Player Movie Format - Branded with Studio Red
      // Sandbox: allow-scripts and allow-same-origin are REQUIRED to avoid "Disable Sandbox" errors.
      // We OMIT allow-popups and allow-top-navigation to block ads.
      const url = `https://vidlink.pro/movie/${activeMedia.id}?primaryColor=e11d48&secondaryColor=171717&iconColor=ffffff&icons=vid&player=jw&title=true&poster=true&autoplay=true&nextbutton=true`;
      return (
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          referrerPolicy="origin"
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    if (activeMedia.type === 'tv') {
      // VidLink JW Player TV Format - Branded with Studio Red
      const season = activeMedia.season || 1;
      const episode = activeMedia.episode || 1;
      const url = `https://vidlink.pro/tv/${activeMedia.id}/${season}/${episode}?primaryColor=e11d48&secondaryColor=171717&iconColor=ffffff&icons=vid&player=jw&title=true&poster=true&autoplay=true&nextbutton=true`;
      return (
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          referrerPolicy="origin"
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-6xl aspect-video p-0 border-none bg-black/90 backdrop-blur-3xl overflow-hidden rounded-2xl md:rounded-[2rem] shadow-[0_0_100px_rgba(225,29,72,0.2)]">
        <DialogTitle className="sr-only">Studio Player</DialogTitle>
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 md:-right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white z-[100] group"
        >
            <X className="size-6 group-hover:scale-110 transition-transform" />
        </button>
        <div className="w-full h-full relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-0 opacity-20 pointer-events-none flex items-center gap-2">
              <ShieldAlert className="size-4" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Hardened Ad-Shield Active</span>
          </div>
          <div className="relative z-10 w-full h-full">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
