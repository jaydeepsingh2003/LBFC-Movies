'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { MovieCarousel } from '@/components/movie-carousel';
import { getPosterUrl, searchMovies as searchTmdb, getMovieVideos } from '@/lib/tmdb.client';
import type { Movie } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';
import { getMovieTimeline } from '@/ai/flows/movie-timeline';
import { useDebounce } from '@/hooks/use-debounce';

interface MovieWithPoster extends Partial<Movie> {
  posterUrl: string | null;
  title: string;
}

const currentYear = new Date().getFullYear();

export default function TimelinePage() {
  const [year, setYear] = useState(1999);
  const [results, setResults] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const debouncedYear = useDebounce(year, 500);

  const fetchMovies = useCallback(async (selectedYear: number) => {
    setIsLoading(true);
    setResults([]);
    try {
      const aiResult = await getMovieTimeline({ year: selectedYear, numberOfRecommendations: 18 });
      
      const moviePromises = aiResult.recommendations.map(async (title) => {
        const searchResults = await searchTmdb(title);
        const movie = searchResults.length > 0 ? searchResults[0] : null;
        if (movie) {
          const videos = await getMovieVideos(movie.id);
          const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
          movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
        }
        return movie;
      });

      const moviesData = (await Promise.all(moviePromises))
        .map((movie, index) => ({
          id: movie ? movie.id : index,
          title: movie ? movie.title : aiResult.recommendations[index],
          posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
          trailerUrl: movie?.trailerUrl,
          overview: movie?.overview || '',
        }));

      const uniqueMovies = moviesData.reduce((acc: MovieWithPoster[], current) => {
        if (!acc.find(item => item.title === current.title)) {
          acc.push(current);
        }
        return acc;
      }, []);

      setResults(uniqueMovies);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get timeline movies. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMovies(debouncedYear);
  }, [debouncedYear, fetchMovies]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Movie Timeline</h1>
            <p className="text-muted-foreground">Travel through cinematic history. Select a year to see its iconic films.</p>
          </header>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">1970</span>
              <h2 className="font-headline text-4xl font-bold text-primary">{year}</h2>
              <span className="text-sm text-muted-foreground">{currentYear}</span>
            </div>
            <Slider
              value={[year]}
              onValueChange={(value) => setYear(value[0])}
              min={1970}
              max={currentYear}
              step={1}
            />
          </div>

          <div className="mt-8">
            {isLoading && results.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <MovieCarousel title={`Iconic Films of ${year}`} movies={results} />
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-foreground">No results for this year</h3>
                <p className="text-muted-foreground mt-2">Try selecting a different year on the timeline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

