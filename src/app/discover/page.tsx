
'use client';

import { useState, useCallback } from 'react';
import DiscoverFilters, { type FilterState } from '@/components/discover-filters';
import { useToast } from '@/hooks/use-toast';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { discoverMovies, discoverTvShows, getPosterUrl, getMovieVideos, getTvShowVideos } from '@/lib/tmdb.client';
import { Loader2, Search, Clapperboard, Monitor, Compass, Filter, Sparkles, LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import FavoriteArtistsSection from '@/components/sections/favorite-artists-section';
import LanguagePicksSection from '@/components/sections/language-picks-section';
import MovieMatchmakerSection from '@/components/movie-matchmaker-section';

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
    <div className="space-y-16 px-4 md:px-8 lg:px-12 py-12 max-w-[2000px] mx-auto min-h-screen">
      
      {/* Header Tier */}
      <header className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
                <Compass className="size-6" />
                <span className="text-sm font-black uppercase tracking-[0.4em]">Global Catalog</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                Discover <span className="text-primary">Cinema</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl font-medium leading-relaxed opacity-80">
              Surgically filtered access to the world's most comprehensive film and television archives.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movie' | 'tv')} className="w-full lg:w-auto">
            <TabsList className="bg-secondary/40 p-1.5 rounded-2xl h-16 w-full lg:w-[400px] border border-white/5 shadow-2xl backdrop-blur-xl">
                <TabsTrigger value="movie" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all">
                  <Clapperboard className="mr-2 size-4"/>Movies
                </TabsTrigger>
                <TabsTrigger value="tv" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all">
                  <Monitor className="mr-2 size-4"/>TV Shows
                </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-muted-foreground mr-4 border-r border-white/10 pr-6">
                <Filter className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Presets</span>
            </div>
            <div className="flex items-center gap-3">
                {QUICK_FILTERS.map((chip) => (
                    <button 
                        key={chip.label} 
                        className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-white/5 border border-white/5 text-muted-foreground hover:bg-white hover:text-black hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl"
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
                    </button>
                ))}
            </div>
        </div>
      </header>

      {/* Filter Tier */}
      <div className="bg-gradient-to-br from-secondary/40 via-background to-background border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Compass className="size-64 rotate-12" />
        </div>
        <DiscoverFilters onSearch={handleSearch} isLoading={isLoading} searchType={activeTab} />
      </div>

      {/* Results Tier */}
      <main className="min-h-[600px] relative space-y-20">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[500px] gap-6">
            <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground animate-pulse font-black tracking-[0.4em] uppercase text-[10px]">Accessing Master Archives...</p>
          </div>
        ) : results.length > 0 ? (
            <div className="space-y-10 animate-in fade-in duration-1000">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg"><LayoutGrid className="size-5 text-primary" /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                            Indexed {totalCount} {activeTab === 'movie' ? 'Film Units' : 'Series Sequences'}
                        </h3>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8">
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
          <div className="flex flex-col items-center justify-center py-32 bg-secondary/10 rounded-[4rem] border-2 border-dashed border-white/5 group hover:border-primary/20 transition-all duration-700">
            <div className="relative mb-10">
                <Search className="h-24 w-24 text-muted-foreground/5 group-hover:text-primary/10 transition-colors" />
                <div className="absolute -top-4 -right-4 bg-primary/20 p-4 rounded-full blur-2xl animate-pulse" />
            </div>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase">Search the Vault</h3>
            <p className="text-muted-foreground mt-4 text-xl font-medium text-center max-w-md px-10 leading-relaxed opacity-60">
              Initialize the precision filter above to unlock thousands of high-fidelity titles from the catalog.
            </p>
          </div>
        )}

        {/* Discovery Tools Tier */}
        <section className="pt-20 border-t border-white/5 space-y-12">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10">
                    <Sparkles className="size-8 text-primary" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0 leading-none">
                        Discovery <span className="text-primary">Laboratory</span>
                    </h2>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Advanced indexers to architect your next cinematic experience.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="p-8 md:p-12 glass-panel rounded-[3rem] border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute -top-20 -right-20 p-20 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 rotate-12">
                        <Sparkles className="size-96 text-primary" />
                    </div>
                    <div className="relative z-10 space-y-16">
                        <FavoriteArtistsSection />
                        <LanguagePicksSection />
                        <MovieMatchmakerSection />
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
