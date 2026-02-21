
"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";
import { X, Maximize, Minimize2, Settings2, Check, Languages, MonitorPlay, ShieldCheck, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

type QualityTier = '720p' | '1080p' | '2k' | '4k';

export function VideoPlayer() {
  const { activeMedia, setActiveMedia } = useVideoPlayer();
  const [server, setServer] = useState<1 | 2 | 3 | 4>(1);
  const [quality, setQuality] = useState<QualityTier>('1080p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const isOpen = !!activeMedia;
  
  const onClose = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    setActiveMedia(null);
    setServer(1);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const cycleServer = (id: 1 | 2 | 3 | 4) => {
    setServer(id);
    toast({ title: "Node Switched", description: `Transitioning to Archive Node ${id}.` });
  };

  const handleQualityChange = (q: QualityTier) => {
    setQuality(q);
    toast({ title: `Quality Target: ${q}`, description: "The player will attempt to match this resolution." });
  };

  const toggleFullScreen = () => {
    const element = playerContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

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

  const renderContent = () => {
    if (!activeMedia) return null;

    if (activeMedia.type === 'youtube') {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${activeMedia.id}?autoplay=1`}
          title="Studio Playback"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          className="w-full h-full"
        ></iframe>
      );
    }

    const studioColor = "e11d48";
    let url = "";
    if (activeMedia.type === 'movie') {
      url = `https://vidsrc.wtf/api/${server}/movie/?id=${activeMedia.id}${server < 3 ? `&color=${studioColor}` : ''}`;
    } else if (activeMedia.type === 'tv') {
      const season = activeMedia.season || 1;
      const episode = activeMedia.episode || 1;
      url = `https://vidsrc.wtf/api/${server}/tv/?id=${activeMedia.id}&s=${season}&e=${episode}${server < 3 ? `&color=${studioColor}` : ''}`;
    }

    return (
      <iframe
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation allow-modals"
        className="w-full h-full bg-black"
      ></iframe>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] md:max-w-[95vw] lg:max-w-7xl p-0 border-none bg-black/95 backdrop-blur-3xl overflow-hidden rounded-none md:rounded-[2rem] shadow-2xl gap-0">
        <DialogTitle className="sr-only">Studio Cinematic Player</DialogTitle>
        
        <div className="flex flex-col lg:flex-row w-full h-full min-h-[70vh] md:min-h-[80vh]">
            
            {/* Main Stage */}
            <div className="flex-1 relative bg-black flex flex-col">
                {/* Floating Top Bar (Always Visible) */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={toggleFullScreen}
                            className="bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full h-10 w-10 hover:bg-primary transition-all active:scale-90"
                        >
                            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize className="size-5" />}
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-full">
                            <ShieldCheck className="size-3 text-green-400" />
                            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Ad-Shield Active</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-primary rounded-full transition-all text-white pointer-events-auto active:scale-90"
                    >
                        <X className="size-6" />
                    </button>
                </div>

                <div ref={playerContainerRef} className="flex-1 w-full aspect-video lg:aspect-auto">
                    {renderContent()}
                </div>
            </div>

            {/* Command Sidebar */}
            <div className="w-full lg:w-80 bg-secondary/30 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col gap-8 max-h-[40vh] lg:max-h-none overflow-y-auto no-scrollbar">
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Settings2 className="size-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Transmission Quality</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {(['720p', '1080p', '2k', '4k'] as QualityTier[]).map((q) => (
                            <button
                                key={q}
                                onClick={() => handleQualityChange(q)}
                                className={cn(
                                    "h-10 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 border",
                                    quality === q 
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10",
                                    q === '4k' && "border-yellow-500/50 text-yellow-500"
                                )}
                            >
                                {quality === q ? <Check className="size-3" /> : (q === '4k' && <Zap className="size-3 fill-current" />)}
                                {q} {q === '4k' && 'ULTRA'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Languages className="size-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Archive Node</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((num) => (
                            <button
                                key={num}
                                onClick={() => cycleServer(num as any)}
                                className={cn(
                                    "h-10 rounded-xl text-[9px] font-black uppercase transition-all border",
                                    server === num 
                                        ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                Mirror {num}
                            </button>
                        ))}
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase font-bold text-center leading-relaxed">
                        Nodes 1 & 2 are optimized for 4K/2K streams. Nodes 3 & 4 prioritize linguistic stability and subtitles.
                    </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-50">
                        <MonitorPlay className="size-3 text-muted-foreground" />
                        <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest">ID: {activeMedia?.id}</span>
                    </div>
                    <Badge variant="outline" className="text-[7px] font-black uppercase border-white/10 text-muted-foreground">Premium Engine v2.8</Badge>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
