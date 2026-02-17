'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, Music, Search, Youtube, Play, Headphones, Globe, Disc, Mic, MicOff } from 'lucide-react';
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
    { label: 'Hindi', query: `trending hindi music videos ${currentYear}` },
    { label: 'Soundtracks', query: `official movie soundtracks ${currentYear} high quality` },
    { label: 'Tamil', query: `trending tamil hits ${currentYear}` },
    { label: 'Telugu', query: `trending telugu hits ${currentYear}` },
    { label: 'Kannada', query: `trending kannada hits ${currentYear}` },
    { label: 'K-Pop', query: 'latest kpop music videos trending' },
    { label: 'Latin', query: 'latest latin music hits' },
    { label: 'French', query: 'musique française trending' },
    { label: 'Japanese', query: 'trending japanese music' },
    { label: 'Punjabi', query: `trending punjabi hits ${currentYear}` },
  ], [currentYear]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(MUSIC_CATEGORIES[0].label);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [videoResults, setVideoResults] = useState<AdvancedMovieSearchOutput | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { setVideoId } = useVideoPlayer();

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const results = await advancedMovieSearch({ query: `${query} official music video` });
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
    // Initial load with default category
    const defaultCat = MUSIC_CATEGORIES[0];
    handleSearch(defaultCat.query);
  }, [handleSearch, MUSIC_CATEGORIES]);

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col justify-center items-center h-[500px] gap-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Global Soundwaves...</p>
        </div>
      );
    }

    if (videoResults && videoResults.results && videoResults.results.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {videoResults.results.map(video => (
            <Card
              key={video.videoId}
              className="overflow-hidden cursor-pointer group bg-secondary/20 border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
              onClick={() => setVideoId(video.videoId)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-primary p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[10px] uppercase font-bold px-2 py-0.5">
                        <Youtube className="size-3 mr-1 text-red-500 fill-current" /> YouTube
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-sm line-clamp-2 text-white/90 group-hover:text-primary transition-colors leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Official Video</p>
                    <Music className="size-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5">
          <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-xl font-bold text-white tracking-tight">Vibe Not Found</h3>
          <p className="text-muted-foreground mt-2 text-center max-w-sm px-6">
            We couldn't find any music videos for "{searchQuery || activeCategory}". Try exploring a different language or artist.
          </p>
        </div>
    );
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 lg:px-12 w-full max-w-[2400px] mx-auto space-y-12">
      <header className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Headphones className="size-5" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">Sonic Discovery Lounge</span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white">
              Pulse <span className="text-primary">Discovery</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium">
              Explore real-time trending hits and movie soundtracks powered by deep YouTube indexing.
            </p>
          </div>

          <div className="relative w-full lg:w-[450px] group flex items-center gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                placeholder="Find tracks or artists..."
                className="pl-14 pr-12 h-16 bg-secondary/40 border-white/5 rounded-2xl text-lg font-medium focus:ring-primary/50 transition-all border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    onClick={toggleVoiceSearch}
                    className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-300",
                        isListening ? "bg-primary text-white animate-pulse" : "text-muted-foreground hover:text-white hover:bg-white/10"
                    )}
                    title={isListening ? "Stop Listening" : "Voice Search"}
                >
                    {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </button>
            </div>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="size-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Mic className="size-4 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Listening for sounds...</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="size-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Global & Cinematic Hubs:</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {MUSIC_CATEGORIES.map((cat) => (
                    <button
                        key={cat.label}
                        onClick={() => handleCategoryClick(cat)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2",
                            activeCategory === cat.label
                                ? "bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20"
                                : "bg-secondary/30 border-white/5 text-muted-foreground hover:bg-secondary/50 hover:text-white"
                        )}
                    >
                        {cat.label === 'Soundtracks' && <Disc className="size-4" />}
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <section className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Music className="text-primary size-6" />
                </div>
                {searchQuery ? `Results for "${searchQuery}"` : `${activeCategory} Trending`}
            </h2>
            {videoResults && videoResults.results && (
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter bg-secondary/40 px-3 py-1 rounded-md">
                    {videoResults.results.length} Videos Indexed
                </span>
            )}
        </div>
        
        {renderContent()}
      </section>
    </div>
  );
}
