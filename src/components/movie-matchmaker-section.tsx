
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Shuffle, Sparkles } from 'lucide-react';
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
      // Call AI to find the perfect cinematic bridge
      const aiResult = await movieMatchmaker({ movie1, movie2 });
      
      // Fetch the actual movie data from TMDB
      const searchResults = await searchTmdb(aiResult.recommendation);
      const movie = searchResults.length > 0 ? searchResults[0] : null;

      if (movie) {
        const videos = await getMovieVideos(movie.id);
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
        
        const movieWithPoster: MovieWithPoster = {
            ...movie,
            posterUrl: getPosterUrl(movie.poster_path),
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
        };
        setResult(movieWithPoster);

      } else {
        toast({
            variant: "destructive",
            title: "Could not find movie",
            description: `AI suggested "${aiResult.recommendation}", but we couldn't find it on TMDB.`
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
        <h2 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary size-6" />
            Movie Matchmaker
        </h2>
        <p className="text-muted-foreground">Find the perfect movie that sits between two of your favorites, fetched from TMDB.</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>Find a Cinematic Bridge</CardTitle>
          <CardDescription>Enter two movies and let AI find the connection through the TMDB database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">First Movie</label>
                <Input
                    placeholder="e.g., The Matrix"
                    value={movie1}
                    onChange={(e) => setMovie1(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Second Movie</label>
                <Input
                    placeholder="e.g., Inception"
                    value={movie2}
                    onChange={(e) => setMovie2(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50"
                />
            </div>
          </div>
          <Button onClick={handleMatch} disabled={isLoading} className="w-full md:w-auto px-10 h-12 rounded-full font-bold">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shuffle className="mr-2 h-5 w-5" />}
            Find Match
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center pt-8">
            <div className="w-full max-w-xs animate-pulse">
                <div className="aspect-[2/3] w-full bg-secondary rounded-xl"></div>
                <div className="h-6 w-3/4 bg-secondary rounded mt-4 mx-auto"></div>
            </div>
        </div>
      )}

      {result && (
        <div className="pt-6 animate-in fade-in zoom-in duration-500">
          <h3 className="text-xl font-headline font-bold mb-6 text-center text-primary">Your Perfect Match</h3>
          <div className="flex justify-center">
            <div className="w-full max-w-xs transform transition-transform hover:scale-105">
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
