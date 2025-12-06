
'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import DiscoverFilters, { type FilterState } from '@/components/discover-filters';
import { useToast } from '@/hooks/use-toast';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { discoverMovies, discoverTvShows, getPosterUrl, getMovieVideos, getTvShowVideos } from '@/lib/tmdb.client';
import type { Movie, TVShow } from '@/lib/tmdb';
import { Loader2, Film, Tv } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DiscoverResult {
  id: number;
  title: string;
  posterUrl: string | null;
  overview: string;
  poster_path?: string | null;
  trailerUrl?: string;
  type: 'movie' | 'tv';
}

export default function DiscoverPage() {
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie');

  const handleSearch = useCallback(async (filters: FilterState) => {
    setIsLoading(true);
    setResults([]);
    try {
      let fetchedItems: DiscoverResult[] = [];
      if (activeTab === 'movie') {
        const movies = await discoverMovies({
          genreId: filters.genre ? parseInt(filters.genre) : undefined,
          primaryReleaseYear: filters.releaseYear[0] !== 1920 ? filters.releaseYear[0] : undefined,
          voteAverageGte: filters.rating[0],
          keywords: filters.keywords,
        });

        const moviePromises = movies.map(async (movie) => {
            const videos = await getMovieVideos(movie.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            return {
                id: movie.id,
                title: movie.title,
                posterUrl: getPosterUrl(movie.poster_path),
                overview: movie.overview,
                poster_path: movie.poster_path,
                trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
                type: 'movie' as const,
            };
        });
        fetchedItems = await Promise.all(moviePromises);

      } else { // TV Show Search
        const tvShows = await discoverTvShows({
          genreId: filters.genre ? parseInt(filters.genre) : undefined,
          firstAirDateYear: filters.releaseYear[0] !== 1920 ? filters.releaseYear[0] : undefined,
          voteAverageGte: filters.rating[0],
          keywords: filters.keywords,
        });
        
         const tvShowPromises = tvShows.map(async (show) => {
            const videos = await getTvShowVideos(show.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            return {
                id: show.id,
                title: show.name,
                posterUrl: getPosterUrl(show.poster_path),
                overview: show.overview,
                poster_path: show.poster_path,
                trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
                type: 'tv' as const,
            };
        });
        fetchedItems = await Promise.all(tvShowPromises);
      }

      setResults(fetchedItems);

      if (fetchedItems.length === 0) {
        toast({
            title: `No ${activeTab === 'movie' ? 'Movies' : 'TV Shows'} Found`,
            description: "Try adjusting your filters for a wider search.",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, activeTab]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="space-y-2 px-4 pt-8 md:px-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Discover</h1>
          <p className="text-muted-foreground">Use advanced filters to find exactly what you're looking for.</p>
        </header>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movie' | 'tv')} className="w-full px-4 md:px-8">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
              <TabsTrigger value="movie"><Film className="mr-2"/>Movies</TabsTrigger>
              <TabsTrigger value="tv"><Tv className="mr-2"/>TV Shows</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="px-4 md:px-8">
          <DiscoverFilters onSearch={handleSearch} isLoading={isLoading} searchType={activeTab} />
        </div>

        <div className="mt-8 px-4 md:px-8 pb-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map((item) => (
                    item.type === 'movie' ? (
                      <MovieCard 
                          key={item.id} 
                          id={item.id} 
                          title={item.title} 
                          posterUrl={item.posterUrl} 
                          trailerUrl={item.trailerUrl} 
                          overview={item.overview} 
                          poster_path={item.poster_path} 
                      />
                    ) : (
                      <TVShowCard
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          posterUrl={item.posterUrl}
                      />
                    )
                  ))}
              </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-foreground">No results to show</h3>
              <p className="text-muted-foreground mt-2">Adjust your filters and start a new search.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
