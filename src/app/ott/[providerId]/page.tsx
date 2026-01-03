
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { discoverMovies, discoverTvShows, getPosterUrl, getMovieVideos, getTvShowVideos } from '@/lib/tmdb.client';
import type { Movie, TVShow } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const languages = [
  { name: 'All', code: '' },
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Kannada', code: 'kn' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Telugu', code: 'te' },
];

export default function OttContentPage(props: { params: { providerId: string } }) {
  const params = React.use(props.params);
  const searchParams = useSearchParams();
  const { providerId } = params;
  const providerName = searchParams.get('name') || 'Provider';
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

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
      if (selectedLanguage) {
          discoverOptions.with_original_language = selectedLanguage;
      }

      const [movieResults, tvShowResults] = await Promise.all([
        discoverMovies(discoverOptions, 10), // 10 pages * 20 results/page = 200
        discoverTvShows(discoverOptions, 10), // 10 pages * 20 results/page = 200
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
  }, [providerId, selectedLanguage]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  
  return (
    <AppLayout>
      <div className="py-8 px-4 md:px-8 space-y-8">
        <header>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Content on {decodeURIComponent(providerName)}
          </h1>
          <p className="text-muted-foreground">Browse movies and TV shows available on this platform.</p>
        </header>

        <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
                <Button 
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                    onClick={() => setSelectedLanguage(lang.code)}
                >
                    {lang.name}
                </Button>
            ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movies' | 'tv')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
              <TabsTrigger value="movies"><Film className="mr-2"/>Movies ({movies.length})</TabsTrigger>
              <TabsTrigger value="tv"><Tv className="mr-2"/>TV Shows ({tvShows.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="movies" className="mt-8">
              {movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold text-foreground">No Movies Found</h3>
                  <p className="text-muted-foreground mt-2">No movies found for this provider and language in your region.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="tv" className="mt-8">
              {tvShows.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold text-foreground">No TV Shows Found</h3>
                  <p className="text-muted-foreground mt-2">No TV shows found for this provider and language in your region.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
