'use client';

import { useState, useCallback } from 'react';
import DiscoverFilters, { type FilterState } from '@/components/discover-filters';
import { useToast } from '@/hooks/use-toast';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { discoverMovies, discoverTvShows, getPosterUrl, getMovieVideos, getTvShowVideos } from '@/lib/tmdb.client';
import { Loader2, Search, Clapperboard, Monitor } from 'lucide-react';
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

      } else { 
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
        description: 'Failed to search catalog. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, activeTab]);

  return (
    <div className="space-y-12 px-4 md:px-8 py-12 max-w-[2000px] mx-auto">
      <header className="space-y-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">Discover</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Explore our vast library. Use precision filters to find your next favorite watch.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movie' | 'tv')} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2 max-w-[300px] mx-auto md:mx-0 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="movie" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Clapperboard className="mr-2 size-4"/>Movies
                </TabsTrigger>
                <TabsTrigger value="tv" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Monitor className="mr-2 size-4"/>TV Shows
                </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="bg-gradient-to-br from-secondary/30 to-background border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
        <DiscoverFilters onSearch={handleSearch} isLoading={isLoading} searchType={activeTab} />
      </div>

      <main className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Searching catalog...</p>
          </div>
        ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
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
          <div className="text-center py-32 bg-secondary/10 rounded-3xl border-2 border-dashed border-white/5">
            <Search className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-2xl font-bold text-foreground">Ready to explore?</h3>
            <p className="text-muted-foreground mt-2 text-lg">Adjust your filters and click search to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}
