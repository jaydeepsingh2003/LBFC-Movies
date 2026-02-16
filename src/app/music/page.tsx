'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Music, Search, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { advancedMovieSearch, type AdvancedMovieSearchOutput } from '@/ai/flows/advanced-movie-search';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useVideoPlayer } from '@/context/video-provider';

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [videoResults, setVideoResults] = useState<AdvancedMovieSearchOutput | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { setVideoId } = useVideoPlayer();

  const handleSearch = useCallback(async () => {
    if (!debouncedSearchQuery) {
      setVideoResults(null);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await advancedMovieSearch({ query: `${debouncedSearchQuery} music video` });
      setVideoResults(results);
    } catch (error) {
      console.error("Error searching youtube", error);
      setVideoResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    if (videoResults && videoResults.results.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videoResults.results.map(video => (
            <Card
              key={video.videoId}
              className="overflow-hidden cursor-pointer group"
              onClick={() => setVideoId(video.videoId)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image src={video.thumbnail} alt={video.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Youtube className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (hasSearched && !isSearching) {
      return (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-foreground">No Videos Found</h3>
          <p className="text-muted-foreground mt-2">Try a different search for music videos.</p>
        </div>
      );
    }
    
    return (
        <div className="text-center py-16">
            <Music className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Find Your Favorite Music Videos</h3>
            <p className="mt-2 text-sm text-muted-foreground">Use the search bar above to find songs, artists, and music videos on YouTube.</p>
        </div>
    );
  };

  return (
    <div className="py-8 px-4 md:px-8 space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Music Video Search
          </h1>
        </div>
        <p className="text-muted-foreground">
          Find music videos for your favorite songs and artists on YouTube.
        </p>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for songs or artists..."
            className="pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <section>
        {renderContent()}
      </section>
    </div>
  );
}
