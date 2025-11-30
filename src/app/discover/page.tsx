
'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import DiscoverFilters, { type FilterState } from '@/components/discover-filters';
import { advancedMovieSearch } from '@/ai/flows/advanced-movie-search';
import { useToast } from '@/hooks/use-toast';
import { MovieCard } from '@/components/movie-card';
import { getPosterUrl, searchMovies as searchTmdb, getMovieVideos } from '@/lib/tmdb.client';
import type { Movie } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';

interface MovieWithPoster extends Movie {
  posterUrl: string | null;
}

export default function DiscoverPage() {
  const [results, setResults] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async (filters: FilterState) => {
    setIsLoading(true);
    setResults([]);
    try {
      const actors = filters.actors.split(',').map(s => s.trim()).filter(Boolean);
      const directors = filters.directors.split(',').map(s => s.trim()).filter(Boolean);

      const searchInput = {
        genre: filters.genre,
        releaseYear: filters.releaseYear as [number, number],
        actors,
        directors,
        rating: filters.rating as [number, number],
        numberOfRecommendations: 24,
      };

      const aiResult = await advancedMovieSearch(searchInput);

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
          ...(movie || { title: aiResult.recommendations[index], poster_path: null, id: 0, overview: "" }),
          id: movie ? movie.id : index,
          title: movie ? movie.title : aiResult.recommendations[index],
          posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
          trailerUrl: movie?.trailerUrl,
          overview: movie?.overview ?? "",
          poster_path: movie?.poster_path
        }));

      const uniqueMovies = moviesData.reduce((acc: MovieWithPoster[], current) => {
        if (!acc.find(item => item.title === current.title)) {
            acc.push(current as MovieWithPoster);
        }
        return acc;
      }, []);

      setResults(uniqueMovies);

      if (uniqueMovies.length === 0) {
        toast({
            title: "No Movies Found",
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
  }, [toast]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Discover Movies</h1>
            <p className="text-muted-foreground">Use advanced filters to find exactly what you're looking for.</p>
          </header>
          
          <DiscoverFilters onSearch={handleSearch} isLoading={isLoading} />

          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {results.map((movie) => (
                        <MovieCard key={movie.id} id={movie.id} title={movie.title} posterUrl={movie.posterUrl} trailerUrl={movie.trailerUrl} overview={movie.overview} poster_path={movie.poster_path} />
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
      </div>
    </AppLayout>
  );
}
