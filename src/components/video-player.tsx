
"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";
import { X, ShieldAlert, RefreshCw, Smartphone, Zap, Copy, Maximize, FastForward } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function VideoPlayer() {
  const { activeMedia, setActiveMedia } = useVideoPlayer();
  const [server, setServer] = useState<1 | 2>(1);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isOpen = !!activeMedia;
  
  const onClose = () => {
    setActiveMedia(null);
    setServer(1);
  };

  const toggleServer = () => {
    setServer(prev => prev === 1 ? 2 : 1);
  };

  const handleFullScreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if ((iframeRef.current as any).webkitRequestFullscreen) {
        (iframeRef.current as any).webkitRequestFullscreen();
      } else if ((iframeRef.current as any).msRequestFullscreen) {
        (iframeRef.current as any).msRequestFullscreen();
      }
      toast({ title: "Entering Cinema Mode", description: "Bigger screen initialized." });
    }
  };

  // VIDSRC.WTF PROGRESS TRACKING
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.vidsrc.wtf") return;
      
      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        const existingProgress = JSON.parse(localStorage.getItem("vidsrcwtf-Progress") || "{}");
        const updatedProgress = { ...existingProgress, ...mediaData };
        localStorage.setItem("vidsrcwtf-Progress", JSON.stringify(updatedProgress));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleExternalPlayer = (player: 'vlc' | 'mx') => {
    if (!activeMedia) return;
    
    let streamUrl = "";
    if (activeMedia.type === 'movie') {
        streamUrl = `https://vidsrc.wtf/api/${server}/movie/?id=${activeMedia.id}&color=e11d48`;
    } else if (activeMedia.type === 'tv') {
        streamUrl = `https://vidsrc.wtf/api/${server}/tv/?id=${activeMedia.id}&s=${activeMedia.season || 1}&e=${activeMedia.episode || 1}&color=e11d48`;
    }

    if (player === 'vlc') {
        window.location.href = `intent://${streamUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=org.videolan.vlc;action=android.intent.action.VIEW;type=video/*;end`;
    } else {
        window.location.href = `intent://${streamUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.mxtech.videoplayer.ad;action=android.intent.action.VIEW;type=video/*;end`;
    }
    
    toast({ title: `Handoff to ${player.toUpperCase()}`, description: "Launching ad-free hardware stream." });
  };

  const handleCopyLink = () => {
    if (!activeMedia) return;
    let link = "";
    if (activeMedia.type === 'movie') {
        link = `https://vidsrc.wtf/api/${server}/movie/?id=${activeMedia.id}&color=e11d48`;
    } else if (activeMedia.type === 'tv') {
        link = `https://vidsrc.wtf/api/${server}/tv/?id=${activeMedia.id}&s=${activeMedia.season || 1}&e=${activeMedia.episode || 1}&color=e11d48`;
    }
    navigator.clipboard.writeText(link);
    toast({ title: "Master Link Copied", description: "Paste into your player's 'Network Stream' for zero ads." });
  };

  const renderContent = () => {
    if (!activeMedia) return null;

    if (activeMedia.type === 'youtube') {
      return (
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${activeMedia.id}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="rounded-xl shadow-2xl"
        ></iframe>
      );
    }

    const studioColor = "e11d48";

    if (activeMedia.type === 'movie') {
      const url = `https://vidsrc.wtf/api/${server}/movie/?id=${activeMedia.id}&color=${studioColor}`;
      return (
        <iframe
          ref={iframeRef}
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          className="rounded-xl shadow-2xl bg-black"
        ></iframe>
      );
    }

    if (activeMedia.type === 'tv') {
      const season = activeMedia.season || 1;
      const episode = activeMedia.episode || 1;
      const url = `https://vidsrc.wtf/api/${server}/tv/?id=${activeMedia.id}&s=${season}&e=${episode}&color=${studioColor}`;
      
      return (
        <iframe
          ref={iframeRef}
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          className="rounded-xl shadow-2xl bg-black"
        ></iframe>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] md:max-w-7xl p-0 border-none bg-black/95 backdrop-blur-3xl overflow-hidden rounded-none md:rounded-[2.5rem] shadow-[0_0_100px_rgba(225,29,72,0.3)] gap-0">
        <DialogTitle className="sr-only">Studio Player</DialogTitle>
        
        {/* TOP COMMAND BAR */}
        <div className="absolute -top-14 left-0 right-0 flex items-center justify-between px-2 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 md:gap-3">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFullScreen}
                    className="glass-card rounded-full border-white/10 text-white hover:bg-primary transition-all font-black uppercase tracking-widest text-[8px] md:text-[10px] h-10 px-4 md:px-6 gap-2"
                >
                    <Maximize className="size-3 md:size-4" />
                    Bigger Screen
                </Button>
                {activeMedia?.type !== 'youtube' && (
                    <>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={toggleServer}
                            className="glass-card rounded-full border-white/10 text-white hover:bg-primary transition-all font-black uppercase tracking-widest text-[8px] md:text-[10px] h-10 px-4 md:px-6 gap-2"
                        >
                            <RefreshCw className={cn("size-3 md:size-4", server === 2 && "rotate-180")} />
                            Mirror {server}
                        </Button>
                        <div className="hidden lg:flex items-center gap-2 bg-primary/10 backdrop-blur-xl px-4 py-2 rounded-full border border-primary/20">
                            <FastForward className="size-3 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Forward Controls Active</span>
                        </div>
                    </>
                )}
            </div>

            <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-primary rounded-full transition-all text-white group shadow-2xl"
            >
                <X className="size-5 md:size-6 group-hover:scale-110 transition-transform" />
            </button>
        </div>

        <div className="flex flex-col lg:flex-row w-full h-full min-h-[60vh] md:min-h-[80vh]">
            {/* VIDEO STAGE */}
            <div className="flex-1 relative group/player bg-black shadow-2xl flex items-center justify-center">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-0 opacity-20 pointer-events-none flex items-center gap-2">
                    <ShieldAlert className="size-4" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Cinematic Hub Established</span>
                </div>
                <div className="relative z-10 w-full h-full aspect-video">
                    {renderContent()}
                </div>
            </div>

            {/* PRO AD-BYPASS SIDEBAR */}
            {activeMedia?.type !== 'youtube' && (
                <div className="w-full lg:w-72 bg-secondary/20 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/5 p-4 md:p-6 flex flex-col justify-center gap-4">
                    <div className="space-y-1 mb-2">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Smartphone className="size-3" /> External Play
                        </h4>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold leading-tight">
                            Use local apps for hardware-accelerated playback and native skip controls.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
                        <Button 
                            onClick={() => handleExternalPlayer('vlc')} 
                            variant="outline" 
                            className="h-12 rounded-xl border-white/5 bg-white/5 hover:bg-orange-500 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] gap-2"
                        >
                            VLC Player
                        </Button>
                        <Button 
                            onClick={() => handleExternalPlayer('mx')} 
                            variant="outline" 
                            className="h-12 rounded-xl border-white/5 bg-white/5 hover:bg-blue-600 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] gap-2"
                        >
                            MX Player
                        </Button>
                    </div>

                    <Button 
                        onClick={handleCopyLink} 
                        variant="ghost" 
                        className="h-12 rounded-xl text-muted-foreground hover:text-primary transition-all font-black uppercase tracking-widest text-[9px] gap-2 border border-dashed border-white/10"
                    >
                        <Copy className="size-3" /> Copy Stream Link
                    </Button>

                    <div className="hidden lg:block pt-4 border-t border-white/5">
                        <p className="text-[7px] text-muted-foreground font-black uppercase text-center tracking-widest opacity-50">
                            Transmission ID: {activeMedia?.id}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
