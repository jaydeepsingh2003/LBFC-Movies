
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, Music, Search, Youtube, Play, Headphones, Globe, Disc, Mic, MicOff, TrendingUp, Zap, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { advancedMovieSearch, type AdvancedMovieSearchOutput } from '@/ai/flows/advanced-movie-search';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useVideoPlayer } from '@/context/video-provider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MusicPage() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  
  const MUSIC_CATEGORIES = useMemo(() => [
    { label: 'Global Hits', query: `latest global music hits ${currentYear}` },
    { label: 'Hindi Trending', query: `trending hindi music videos ${currentYear}` },
    { label: 'Official Soundtracks', query: `official movie soundtracks ${currentYear} high quality` },
    { label: 'Tamil Hits', query: `trending tamil hits ${currentYear}` },
    { label: 'Telugu Hits', query: `trending telugu hits ${currentYear}` },
    { label: 'K-Pop', query: 'latest kpop music videos trending' },
    { label: 'Latin', query: 'latest latin music hits' },
    { label: 'Japanese', query: 'trending japanese music' },
    { label: 'Punjabi', query: `trending punjabi hits ${currentYear}` },
  ], [currentYear]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(MUSIC_CATEGORIES[0].label);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [videoResults, setVideoResults] = useState<AdvancedMovieSearchOutput | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { setVideoId } = useVideoPlayer();

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      // Prioritize "official music video" context for premium results
      const results = await advancedMovieSearch({ query: `${query} official music video 4k` });
      setVideoResults(results);
    } catch (error) {
      console.error("Error searching youtube", error);
      setVideoResults({ results: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleCategoryClick = (category: typeof MUSIC_CATEGORIES[0]) => {
    setSearchQuery('');
    setActiveCategory(category.label);
    handleSearch(category.query);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Voice search is not supported in your browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setActiveCategory('');
      handleSearch(transcript);
    };
    recognition.start();
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      setActiveCategory('');
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, handleSearch]);

  useEffect(() => {
    // Initial entry fetch
    handleSearch(MUSIC_CATEGORIES[0].query);
  }, [MUSIC_CATEGORIES, handleSearch]);

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col justify-center items-center h-[500px] gap-6">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Syncing Global Soundwaves...</p>
        </div>
      );
    }

    if (videoResults && videoResults.results && videoResults.results.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8">
          {videoResults.results.map(video => (
            <Card
              key={video.videoId}
              className="overflow-hidden cursor-pointer group bg-secondary/20 border-white/5 hover:border-primary/50 transition-all duration-700 hover:shadow-[0_30px_60px_rgba(225,29,72,0.15)] rounded-[2rem] relative"
              onClick={() => setVideoId(video.videoId)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                    <div className="bg-primary p-5 rounded-full shadow-[0_0_40px_rgba(225,29,72,0.6)] scale-75 group-hover:scale-100 transition-all duration-500">
                        <Play className="w-10 h-10 text-white fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/80 backdrop-blur-xl border-white/10 text-[9px] font-black uppercase px-3 py-1 tracking-widest shadow-2xl">
                        <Youtube className="size-3 mr-1.5 text-red-500 fill-current" /> Official Source
                    </Badge>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-black text-sm lg:text-base line-clamp-2 text-white group-hover:text-primary transition-colors leading-tight uppercase tracking-tighter">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Radio className="size-3 text-primary animate-pulse" />
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Master Transmission</p>
                    </div>
                    <Music className="size-3 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[4rem] border-2 border-dashed border-white/5 relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Search className="h-20 w-20 text-muted-foreground/10 mb-8 group-hover:text-primary/20 transition-colors" />
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Signal Interrupted</h3>
          <p className="text-muted-foreground mt-4 text-center max-w-sm px-10 text-lg font-medium opacity-60 leading-relaxed">
            We couldn't locate dynamic tracks for "{searchQuery || activeCategory}". Try searching for global icons like "Interstellar Soundtrack".
          </p>
        </div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 w-full max-w-[2400px] mx-auto space-y-20">
      <header className="space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Headphones className="size-6" />
              <span className="text-sm font-black uppercase tracking-[0.4em]">Sonic Discovery Lounge</span>
            </div>
            <h1 className="font-headline text-4xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none">
              Pulse <span className="text-primary">Discovery</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl font-medium leading-relaxed opacity-80">
              Real-time synchronization with global music trends, official soundtracks, and cinematic audio architectures.
            </p>
          </div>

          <div className="relative w-full lg:w-[500px] group flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-all" />
                <Input
                placeholder="Find tracks, artists, or movies..."
                className="pl-16 pr-16 h-20 bg-secondary/40 border-white/5 rounded-[2rem] text-xl font-black uppercase tracking-tighter focus:ring-primary/20 transition-all border-2 backdrop-blur-3xl shadow-2xl placeholder:text-muted-foreground/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    onClick={toggleVoiceSearch}
                    className={cn(
                        "absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all duration-500 active:scale-90",
                        isListening ? "bg-primary text-white animate-pulse shadow-[0_0_30px_rgba(225,29,72,0.6)]" : "text-muted-foreground hover:text-white hover:bg-white/10"
                    )}
                    title={isListening ? "Stop Listening" : "Voice Search"}
                >
                    {isListening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                </button>
            </div>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-6 bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-700 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            <div className="size-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(225,29,72,0.5)] relative z-10">
              <Mic className="size-7 text-white" />
            </div>
            <div className="space-y-1 relative z-10">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-primary block">Audio Recognition Active</span>
                <p className="text-lg md:text-xl text-white font-black uppercase tracking-tighter">"Search for Interstellar Main Theme"</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global & Cinematic Hubs:</span>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4">
                {MUSIC_CATEGORIES.map((cat) => (
                    <button
                        key={cat.label}
                        onClick={() => handleCategoryClick(cat)}
                        className={cn(
                            "px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-3 shadow-xl",
                            activeCategory === cat.label
                                ? "bg-primary border-primary text-white scale-105 shadow-[0_20px_40px_rgba(225,29,72,0.3)]"
                                : "bg-secondary/30 border-white/5 text-muted-foreground hover:bg-secondary/50 hover:text-white"
                        )}
                    >
                        {cat.label.includes('Soundtracks') && <Disc className="size-4 animate-spin-slow" />}
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <section className="space-y-12 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl">
                    <TrendingUp className="text-primary size-8" />
                </div>
                <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tighter uppercase text-white leading-none">
                    {searchQuery ? `Results for "${searchQuery}"` : `${activeCategory}`}
                </h2>
            </div>
            {videoResults && videoResults.results && (
                <Badge variant="outline" className="text-[10px] font-black border-white/10 px-6 py-2 rounded-full uppercase tracking-[0.3em] text-muted-foreground bg-secondary/20 shadow-2xl">
                    {videoResults.results.length} Dynamic Sources Located
                </Badge>
            )}
        </div>
        
        {renderContent()}
      </section>
    </div>
  );
}
