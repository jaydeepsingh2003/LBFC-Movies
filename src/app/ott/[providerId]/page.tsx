'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { discoverMovies, discoverTvShows, getPosterUrl, getMovieVideos } from '@/lib/tmdb.client';
import type { Movie, TVShow } from '@/lib/tmdb';
import { Loader2, Film, Tv } from 'lucide-react';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OttContentPage(props: { params: { providerId: string } }) {
  const params = React.use(props.params);
  const searchParams = useSearchParams();
  const { providerId } = params;
  const providerName = searchParams.get('name') || 'Provider';
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  const fetchContent = useCallback(async () => {
    if (!providerId) return;

    setIsLoading(true);
    setMovies([]);
    setTvShows([]);

    try {
      const discoverOptions: any = { 
          with_watch_providers: providerId, 
          watch_region: 'IN'
      };

      const [movieResults, tvShowResults] = await Promise.all([
        discoverMovies(discoverOptions, 10),
        discoverTvShows(discoverOptions, 10),
      ]);

      const moviesWithTrailers = await Promise.all(
        movieResults.map(async (movie) => {
          const videos = await getMovieVideos(movie.id);
          const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
          return {
            ...movie,
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
          };
        })
      );
      setMovies(moviesWithTrailers);
      setTvShows(tvShowResults);

    } catch (error) {
      console.error(`Error fetching content for provider ${providerId}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  
  return (
    <div className="py-12 px-4 md:px-8 space-y-12 min-h-screen">
      <header className="space-y-2">
        <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">
          Content on <span className="text-primary">{decodeURIComponent(providerName)}</span>
        </h1>
        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] opacity-60">Surgically filtered catalog for your current region.</p>
      </header>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[500px] gap-6">
          <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground animate-pulse font-black tracking-[0.4em] uppercase text-[10px]">Retrieving Platform Catalog...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movies' | 'tv')} className="w-full space-y-12">
          <TabsList className="bg-secondary/40 p-1.5 rounded-2xl h-16 w-full max-w-md mx-auto border border-white/5 backdrop-blur-xl">
            <TabsTrigger value="movies" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all">
              <Film className="mr-2 size-4"/>Movies ({movies.length})
            </TabsTrigger>
            <TabsTrigger value="tv" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all">
              <Tv className="mr-2 size-4"/>TV Shows ({tvShows.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="movies" className="mt-0 outline-none">
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 animate-in fade-in duration-1000">
                {movies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={getPosterUrl(movie.poster_path)}
                    overview={movie.overview}
                    poster_path={movie.poster_path}
                    trailerUrl={movie.trailerUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-panel rounded-[3rem] border-2 border-dashed border-white/5">
                <Film className="mx-auto size-16 text-muted-foreground/20 mb-6" />
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Archive Empty</h3>
                <p className="mt-2 text-muted-foreground font-medium uppercase text-[10px] tracking-widest">No movie transmissions located for this node.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tv" className="mt-0 outline-none">
            {tvShows.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 animate-in fade-in duration-1000">
                {tvShows.map(show => (
                  <TVShowCard
                    key={show.id}
                    id={show.id}
                    title={show.name}
                    posterUrl={getPosterUrl(show.poster_path)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-panel rounded-[3rem] border-2 border-dashed border-white/5">
                <Tv className="mx-auto size-16 text-muted-foreground/20 mb-6" />
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Archive Empty</h3>
                <p className="mt-2 text-muted-foreground font-medium uppercase text-[10px] tracking-widest">No series sequences located for this node.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
