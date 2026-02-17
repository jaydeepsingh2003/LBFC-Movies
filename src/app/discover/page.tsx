'use client';

import { useState, useCallback, useEffect } from 'react';
import DiscoverFilters, { type FilterState } from '@/components/discover-filters';
import { useToast } from '@/hooks/use-toast';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { discoverMovies, discoverTvShows, getPosterUrl, getMovieVideos, getTvShowVideos } from '@/lib/tmdb.client';
import { Loader2, Search, Clapperboard, Monitor, Compass, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface DiscoverResult {
  id: number;
  title: string;
  posterUrl: string | null;
  overview: string;
  poster_path?: string | null;
  trailerUrl?: string;
  type: 'movie' | 'tv';
}

const QUICK_FILTERS = [
  { label: 'Popular', sortBy: 'popularity.desc' },
  { label: 'Top Rated', sortBy: 'vote_average.desc' },
  { label: 'Newest', sortBy: 'primary_release_date.desc' },
  { label: 'Blockbusters', sortBy: 'revenue.desc' },
];

export default function DiscoverPage() {
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie');
  const [totalCount, setTotalCount] = useState(0);
  
  const currentYear = new Date().getFullYear();

  const handleSearch = useCallback(async (filters: FilterState) => {
    setIsLoading(true);
    setResults([]);
    try {
      let fetchedItems: DiscoverResult[] = [];
      if (activeTab === 'movie') {
        const movies = await discoverMovies({
          genreId: filters.genre ? parseInt(filters.genre) : undefined,
          primaryReleaseYear: filters.releaseYear[0],
          voteAverageGte: filters.rating[0],
          keywords: filters.keywords,
          with_original_language: filters.language || undefined,
          with_watch_providers: filters.provider || undefined,
          sort_by: filters.sortBy,
          watch_region: 'IN'
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
          firstAirDateYear: filters.releaseYear[0],
          voteAverageGte: filters.rating[0],
          keywords: filters.keywords,
          with_original_language: filters.language || undefined,
          with_watch_providers: filters.provider || undefined,
          sortBy: filters.sortBy,
          watch_region: 'IN'
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
      setTotalCount(fetchedItems.length);

      if (fetchedItems.length === 0) {
        toast({
            title: `No ${activeTab === 'movie' ? 'Movies' : 'TV Shows'} Found`,
            description: "Try widening your filters or removing some keywords.",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'Failed to connect to catalog. Please check your connection.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, activeTab]);

  return (
    <div className="space-y-12 px-4 md:px-8 lg:px-12 py-6 max-w-[2000px] mx-auto min-h-screen">
      
      {/* Header Tier */}
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
                <Compass className="size-5" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Global Catalog</span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white">Discover</h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium">
              Precision tools to find exactly what you're in the mood for across all origins.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movie' | 'tv')} className="w-full md:w-auto">
            <TabsList className="bg-secondary/40 p-1 rounded-2xl h-14 w-full md:w-[320px]">
                <TabsTrigger value="movie" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
                  <Clapperboard className="mr-2 size-4"/>Movies
                </TabsTrigger>
                <TabsTrigger value="tv" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
                  <Monitor className="mr-2 size-4"/>TV Shows
                </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 text-muted-foreground mr-2 border-r border-white/10 pr-4">
                <Filter className="size-4" />
                <span className="text-xs font-bold uppercase">Quick Filters:</span>
            </div>
            {QUICK_FILTERS.map((chip) => (
                <Badge 
                    key={chip.label} 
                    variant="outline" 
                    className="px-4 py-1.5 rounded-full cursor-pointer hover:bg-white hover:text-black transition-colors whitespace-nowrap bg-secondary/20 border-white/5"
                    onClick={() => handleSearch({ 
                        genre: '', 
                        releaseYear: [currentYear], 
                        keywords: '', 
                        rating: [5, 10], 
                        language: '', 
                        provider: '', 
                        sortBy: chip.sortBy 
                    })}
                >
                    {chip.label}
                </Badge>
            ))}
        </div>
      </header>

      {/* Filter Tier */}
      <div className="bg-gradient-to-br from-secondary/40 to-background border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm">
        <DiscoverFilters onSearch={handleSearch} isLoading={isLoading} searchType={activeTab} />
      </div>

      {/* Results Tier */}
      <main className="min-h-[500px] relative">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[400px] gap-6">
            <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Archives...</p>
          </div>
        ) : results.length > 0 ? (
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Found {totalCount} {activeTab === 'movie' ? 'Movies' : 'Series'}
                    </h3>
                </div>
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
            </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5 group hover:border-primary/20 transition-colors">
            <div className="relative mb-6">
                <Search className="h-20 w-20 text-muted-foreground/10 group-hover:text-primary/20 transition-colors" />
                <div className="absolute -top-2 -right-2 bg-primary/20 p-2 rounded-full blur-xl animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">Search the Vault</h3>
            <p className="text-muted-foreground mt-3 text-lg font-medium text-center max-w-md px-6">
              Adjust your filters above and click search to unlock thousands of titles from the catalog.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
