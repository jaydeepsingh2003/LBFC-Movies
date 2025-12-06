
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { movieMatchmaker } from '@/ai/flows/movie-matchmaker';
import { getPosterUrl, searchMovies as searchTmdb, getMovieVideos } from '@/lib/tmdb.client';
import type { Movie } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie-card';

interface MovieWithPoster extends Movie {
  posterUrl: string | null;
}

export default function MovieMatchmakerSection() {
  const [movie1, setMovie1] = useState('');
  const [movie2, setMovie2] = useState('');
  const [result, setResult] = useState<MovieWithPoster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMatch = async () => {
    if (!movie1 || !movie2) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter two movie titles to find a match.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const aiResult = await movieMatchmaker({ movie1, movie2 });
      const searchResults = await searchTmdb(aiResult.recommendation);
      const movie = searchResults.length > 0 ? searchResults[0] : null;

      if (movie) {
        const videos = await getMovieVideos(movie.id);
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
        movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
        
        const movieWithPoster = {
            ...movie,
            posterUrl: getPosterUrl(movie.poster_path),
        };
        setResult(movieWithPoster);

      } else {
        toast({
            variant: "destructive",
            title: "Could not find movie",
            description: `We couldn't find details for "${aiResult.recommendation}".`
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to find a movie match. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">Movie Matchmaker</h2>
        <p className="text-muted-foreground">Find the perfect movie that sits between two of your favorites.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find a Cinematic Bridge</CardTitle>
          <CardDescription>Enter two movies and let AI find the connection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="e.g., The Matrix"
              value={movie1}
              onChange={(e) => setMovie1(e.target.value)}
              disabled={isLoading}
            />
            <Input
              placeholder="e.g., Inception"
              value={movie2}
              onChange={(e) => setMovie2(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleMatch} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
            Find Match
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center pt-8">
            <div className="w-full max-w-xs">
                <div className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>
            </div>
        </div>
      )}

      {result && (
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Your Recommendation</h3>
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
                <MovieCard
                    id={result.id}
                    title={result.title}
                    posterUrl={result.posterUrl}
                    trailerUrl={result.trailerUrl}
                    overview={result.overview}
                    poster_path={result.poster_path}
                />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
