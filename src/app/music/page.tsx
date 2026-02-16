
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Music, Search, Youtube, Play, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { advancedMovieSearch, type AdvancedMovieSearchOutput } from '@/ai/flows/advanced-movie-search';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useVideoPlayer } from '@/context/video-provider';
import { Badge } from '@/components/ui/badge';

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [videoResults, setVideoResults] = useState<AdvancedMovieSearchOutput | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { setVideoId } = useVideoPlayer();

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await advancedMovieSearch({ query: `${query} music video` });
      setVideoResults(results);
    } catch (error) {
      console.error("Error searching youtube", error);
      setVideoResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch trending on initial mount
  useEffect(() => {
    if (!debouncedSearchQuery) {
      handleSearch('latest global hits 2025');
    } else {
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, handleSearch]);

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col justify-center items-center h-[400px] gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Syncing with YouTube...</p>
        </div>
      );
    }

    if (videoResults && videoResults.results.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {videoResults.results.map(video => (
            <Card
              key={video.videoId}
              className="overflow-hidden cursor-pointer group bg-secondary/20 border-white/5 hover:border-primary/50 transition-all duration-300"
              onClick={() => setVideoId(video.videoId)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-primary p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[10px] uppercase font-bold">
                        <Youtube className="size-3 mr-1 text-red-500" /> YouTube
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-sm line-clamp-2 text-white/90 group-hover:text-primary transition-colors leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">Music Video</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (hasSearched && !isSearching) {
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-secondary/10 rounded-[2rem] border-2 border-dashed border-white/5">
          <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-xl font-bold text-white">No Results Found</h3>
          <p className="text-muted-foreground mt-2 text-center max-w-sm">
            We couldn't find any music videos for "{debouncedSearchQuery}". Try a different artist or song.
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 w-full max-w-[2000px] mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Music Lounge</span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white">
            Audio <span className="text-primary">Visuals</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl font-medium">
            Find and watch music videos for your favorite soundtracks, songs, and artists on YouTube.
          </p>
        </div>

        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search artists, songs, bands..."
            className="pl-12 h-14 bg-secondary/40 border-white/5 rounded-2xl text-base font-medium focus:ring-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                <Music className="text-primary size-6" />
                {debouncedSearchQuery ? `Results for "${debouncedSearchQuery}"` : "Trending Music Videos"}
            </h2>
        </div>
        {renderContent()}
      </section>
    </div>
  );
}
