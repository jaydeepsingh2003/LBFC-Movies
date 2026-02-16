'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Music, Search, Youtube, Play, Sparkles, Globe, Disc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { advancedMovieSearch, type AdvancedMovieSearchOutput } from '@/ai/flows/advanced-movie-search';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useVideoPlayer } from '@/context/video-provider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MusicPage() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
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
  const { setVideoId } = useVideoPlayer();

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      // Use AI to find the best music matches
      const results = await advancedMovieSearch({ query: `${query} official music video` });
      setVideoResults(results);
    } catch (error) {
      console.error("Error searching youtube", error);
      setVideoResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle category selection
  const handleCategoryClick = (category: typeof MUSIC_CATEGORIES[0]) => {
    setSearchQuery(''); // Clear manual search when clicking category
    setActiveCategory(category.label);
    handleSearch(category.query);
  };

  // Effect for manual search
  useEffect(() => {
    if (debouncedSearchQuery) {
      setActiveCategory(''); // De-select category when typing
      handleSearch(debouncedSearchQuery);
    } else if (!activeCategory) {
        // If query is cleared and no category is active, reset to default
        const defaultCat = MUSIC_CATEGORIES[0];
        setActiveCategory(defaultCat.label);
        handleSearch(defaultCat.query);
    }
  }, [debouncedSearchQuery, handleSearch, activeCategory, MUSIC_CATEGORIES]);

  // Initial fetch
  useEffect(() => {
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

    if (videoResults && videoResults.results.length > 0) {
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
            We couldn't find any music videos for "{debouncedSearchQuery || searchQuery}". Try exploring a different language or artist.
          </p>
        </div>
    );
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 lg:px-12 w-full max-w-[2400px] mx-auto space-y-12">
      {/* Header Section */}
      <header className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-5" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">Global Music Lounge</span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white">
              Sonic <span className="text-primary">Discovery</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium">
              Explore real-time trending hits and movie soundtracks. 
              Powered by deep YouTube indexing for up-to-the-minute global insights.
            </p>
          </div>

          <div className="relative w-full lg:w-[450px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search artists, tracks, or cultural hits..."
              className="pl-14 h-16 bg-secondary/40 border-white/5 rounded-2xl text-lg font-medium focus:ring-primary/50 transition-all border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Category Chips */}
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

      {/* Main Content Gallery */}
      <section className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Music className="text-primary size-6" />
                </div>
                {debouncedSearchQuery ? `Results for "${debouncedSearchQuery}"` : `${activeCategory} Trending`}
            </h2>
            {videoResults && (
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter bg-secondary/40 px-3 py-1 rounded-md">
                    Live from YouTube • {videoResults.results.length} Videos
                </span>
            )}
        </div>
        
        {renderContent()}
      </section>
    </div>
  );
}
