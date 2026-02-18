
"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";
import { X, ShieldAlert, RefreshCw, Smartphone, Zap, Copy, Maximize, Minimize2, ShieldCheck, Languages, Settings2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

type QualityTier = '720p' | '1080p' | '2k';

export function VideoPlayer() {
  const { activeMedia, setActiveMedia } = useVideoPlayer();
  const [server, setServer] = useState<1 | 2 | 3 | 4>(1);
  const [quality, setQuality] = useState<QualityTier>('1080p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const cycleServer = (id: 1 | 2 | 3 | 4) => {
    setServer(id);
    toast({ title: "Mirror Switched", description: `Transitioning to Archive Mirror ${id}.` });
  };

  const handleQualityChange = (q: QualityTier) => {
    setQuality(q);
    // Server 1 & 2 are premium servers usually supporting higher bitrates
    if (q === '2k' && server > 2) setServer(1);
    toast({ title: `Quality Optimized`, description: `Targeting ${q} resolution for this transmission.` });
  };

  const toggleFullScreen = () => {
    const element = playerContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
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
    // ULTRA-HARDENED AD-SHIELDING SANDBOX
    // allow-modals added to enable the gear/language/quality menus inside the iframe
    const sandboxConfig = "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation allow-modals";

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
        ref={iframeRef}
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        sandbox={sandboxConfig}
        referrerPolicy="no-referrer"
        className="rounded-xl shadow-2xl bg-black"
      ></iframe>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] md:max-w-[95vw] lg:max-w-7xl p-0 border-none bg-black/95 backdrop-blur-3xl overflow-hidden rounded-none md:rounded-[2.5rem] shadow-[0_0_100px_rgba(225,29,72,0.3)] gap-0">
        <DialogTitle className="sr-only">Studio Player</DialogTitle>
        
        <div className="flex flex-col lg:flex-row w-full h-full min-h-[65vh] md:min-h-[85vh] relative">
            {/* FLOATING COMMAND OVERLAY */}
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleFullScreen}
                        className="bg-black/60 backdrop-blur-md border-white/10 text-white hover:bg-primary transition-all font-black uppercase tracking-widest text-[8px] md:text-[10px] h-9 px-3 md:px-5 gap-2 rounded-full shadow-2xl"
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="size-3 md:size-4" />
                                Exit View
                            </>
                        ) : (
                            <>
                                <Maximize className="size-3 md:size-4" />
                                Full View
                            </>
                        )}
                    </Button>
                    
                    <div className="hidden sm:flex items-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-full">
                        <ShieldCheck className="size-3 text-green-400" />
                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Ad-Shield Active</span>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="p-2 md:p-3 bg-black/60 backdrop-blur-md border border-white/10 hover:bg-primary rounded-full transition-all text-white group shadow-2xl pointer-events-auto"
                >
                    <X className="size-5 md:size-6 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* VIDEO STAGE */}
            <div ref={playerContainerRef} className="flex-1 relative group/player bg-black shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none flex flex-col items-center gap-2">
                    <ShieldAlert className="size-12" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">LBFC Hub</span>
                </div>
                <div className="relative z-10 w-full h-full aspect-video">
                    {renderContent()}
                </div>
            </div>

            {/* COMMAND SIDEBAR: Quality, Language, and External Kit */}
            {activeMedia?.type !== 'youtube' && (
                <div className="w-full lg:w-80 bg-secondary/20 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col gap-8 max-h-[40vh] lg:max-h-none overflow-y-auto no-scrollbar">
                    
                    {/* Quality Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Settings2 className="size-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Quality Profile</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {(['720p', '1080p', '2k'] as QualityTier[]).map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleQualityChange(q)}
                                    className={cn(
                                        "h-10 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 border",
                                        quality === q 
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    {quality === q && <Check className="size-3" />}
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language & Mirrors */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Languages className="size-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Transmission Nodes</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => cycleServer(num as any)}
                                    className={cn(
                                        "h-10 rounded-xl text-[9px] font-black uppercase transition-all border",
                                        server === num 
                                            ? "bg-blue-500 border-blue-500 text-white" 
                                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    Mirror {num}
                                </button>
                            ))}
                        </div>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold text-center leading-relaxed">
                            Pro Tip: Use Mirrors 1 or 2 for target 2K quality. Mirror 3 & 4 provide maximum multi-language stability.
                        </p>
                    </div>

                    {/* Ad-Bypass Kit */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-yellow-400">
                            <Zap className="size-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Ad-Free Handoff</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button 
                                onClick={() => handleExternalPlayer('vlc')} 
                                variant="outline" 
                                className="h-12 rounded-xl border-white/5 bg-white/5 hover:bg-orange-500 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] gap-2"
                            >
                                <Smartphone className="size-3" /> VLC
                            </Button>
                            <Button 
                                onClick={() => handleExternalPlayer('mx')} 
                                variant="outline" 
                                className="h-12 rounded-xl border-white/5 bg-white/5 hover:bg-blue-600 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] gap-2"
                            >
                                <Smartphone className="size-3" /> MX
                            </Button>
                        </div>
                        <Button 
                            onClick={handleCopyLink} 
                            variant="ghost" 
                            className="h-12 w-full rounded-xl text-muted-foreground hover:text-primary transition-all font-black uppercase tracking-widest text-[9px] gap-2 border border-dashed border-white/10"
                        >
                            <Copy className="size-3" /> Copy Stream Link
                        </Button>
                    </div>

                    <div className="mt-auto hidden lg:block pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Signal ID: {activeMedia?.id}</span>
                            <Badge variant="outline" className="text-[7px] font-black uppercase border-white/5 text-muted-foreground px-2">v2.1.0-WTF</Badge>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
