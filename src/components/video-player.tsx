
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";
import { X, ShieldAlert, RefreshCw, Layers } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function VideoPlayer() {
  const { activeMedia, setActiveMedia } = useVideoPlayer();
  const [mirror, setMirror] = useState<'xyz' | 'to'>('xyz');

  const isOpen = !!activeMedia;
  const onClose = () => {
    setActiveMedia(null);
    setMirror('xyz'); // Reset to primary mirror on close
  };

  const toggleMirror = () => {
    setMirror(prev => prev === 'xyz' ? 'to' : 'xyz');
  };

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

    // High-Performance Dual Mirror Logic
    const baseDomain = mirror === 'xyz' ? 'vidsrc.xyz' : 'vidsrc.to';

    if (activeMedia.type === 'movie') {
      const url = `https://${baseDomain}/embed/movie/${activeMedia.id}`;
      return (
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    if (activeMedia.type === 'tv') {
      const season = activeMedia.season || 1;
      const episode = activeMedia.episode || 1;
      const url = mirror === 'xyz' 
        ? `https://vidsrc.xyz/embed/tv/${activeMedia.id}/${season}/${episode}`
        : `https://vidsrc.to/embed/tv/${activeMedia.id}/${season}/${episode}`;
      
      return (
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
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
        
        {/* Top Controls Tier */}
        <div className="absolute -top-14 left-0 right-0 flex items-center justify-between px-2 z-[100]">
            <div className="flex items-center gap-3">
                {activeMedia?.type !== 'youtube' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleMirror}
                        className="glass-card rounded-full border-white/10 text-white hover:bg-primary transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px] h-10 px-6 gap-2"
                    >
                        <RefreshCw className={cn("size-3 md:size-4", mirror === 'to' && "animate-spin-once")} />
                        Switch to Mirror {mirror === 'xyz' ? '2' : '1'}
                    </Button>
                )}
                <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
                    <Layers className="size-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Source: {mirror === 'xyz' ? 'VDR High-Speed' : 'VidSrc Prime'}
                    </span>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-primary rounded-full transition-all text-white group"
            >
                <X className="size-5 md:size-6 group-hover:scale-110 transition-transform" />
            </button>
        </div>

        <div className="w-full h-full relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-0 opacity-20 pointer-events-none flex items-center gap-2">
              <ShieldAlert className="size-4" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Hardware Link Active</span>
          </div>
          <div className="relative z-10 w-full h-full">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
