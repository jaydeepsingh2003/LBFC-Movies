'use client';

import { useState, useEffect } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { MovieDetails, CastMember, CrewMember } from '@/lib/tmdb';
import { getMovieTrivia } from '@/ai/flows/movie-trivia';
import { AppLayout } from '@/components/layout/app-layout';
import Image from 'next/image';
import { Loader2, PlayCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';

interface MovieDetailsWithMedia extends MovieDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
}

interface Trivia {
    behindTheScenes: string[];
    trivia: string[];
    goofs: string[];
}

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<MovieDetailsWithMedia | null>(null);
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId } = useVideoPlayer();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const movieId = parseInt(params.id, 10);
        const movieDetails = await getMovieDetails(movieId);
        
        const movieWithMedia = {
          ...movieDetails,
          posterUrl: getPosterUrl(movieDetails.poster_path),
          backdropUrl: getBackdropUrl(movieDetails.backdrop_path),
        };
        setMovie(movieWithMedia);

        const triviaResult = await getMovieTrivia({ movieTitle: movieDetails.title });
        setTrivia(triviaResult);

      } catch (error) {
        console.error("Failed to fetch movie details or trivia", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handlePlayTrailer = () => {
    const trailer = movie?.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
    if (trailer) {
      setVideoId(trailer.key);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-32 w-32 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!movie) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Movie not found</h2>
          <p className="text-muted-foreground mt-2">We couldn't find details for this movie.</p>
        </div>
      </AppLayout>
    );
  }

  const renderCreditList = (items: (CastMember | CrewMember)[], maxItems = 12) => (
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.slice(0, maxItems).map(item => (
        <Card key={item.id} className="bg-card/50">
          <CardContent className="p-3 flex items-center gap-3">
            <Avatar>
              <AvatarImage src={item.profile_path ? getPosterUrl(item.profile_path) : undefined} />
              <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{'character' in item ? item.character : item.job}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout showSidebar={false}>
      <div className="relative h-96 md:h-[32rem] w-full">
        {movie.backdropUrl && <Image src={movie.backdropUrl} alt={movie.title} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="relative -mt-48 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <Card className="overflow-hidden border-2 border-primary shadow-lg">
              <CardContent className="p-0 aspect-[2/3] relative w-full">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />}
              </CardContent>
            </Card>
            <Button onClick={handlePlayTrailer} className="w-full mt-4" size="lg">
              <PlayCircle className="mr-2" /> Play Trailer
            </Button>
          </div>

          <div className="w-full md:w-3/4 space-y-6">
            <header className="space-y-2">
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">{movie.title}</h1>
              <p className="text-muted-foreground text-lg">{movie.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => <Badge key={genre.id} variant="secondary">{genre.name}</Badge>)}
              </div>
            </header>

            <p className="text-foreground/80 leading-relaxed">{movie.overview}</p>
            
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 10</span>
                </div>
                <span className="text-muted-foreground">&#8226;</span>
                <span className="text-muted-foreground">{new Date(movie.release_date).getFullYear()}</span>
                 <span className="text-muted-foreground">&#8226;</span>
                <span className="text-muted-foreground">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>

            <section className="space-y-4">
              <h2 className="font-headline text-2xl font-bold">Cast</h2>
              {renderCreditList(movie.credits.cast)}
            </section>

             {trivia && (
                <section className="space-y-4 pt-8">
                    <h2 className="font-headline text-2xl font-bold">Behind the Scenes</h2>
                    <div className="space-y-6 text-sm">
                        {trivia.trivia.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-accent">Trivia</h3>
                                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                                    {trivia.trivia.map((item, index) => <li key={`trivia-${index}`}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                         {trivia.behindTheScenes.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-accent">Production Notes</h3>
                                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                                    {trivia.behindTheScenes.map((item, index) => <li key={`bts-${index}`}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        {trivia.goofs.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-accent">Goofs</h3>
                                 <ul className="list-disc list-inside space-y-2 text-foreground/80">
                                    {trivia.goofs.map((item, index) => <li key={`goof-${index}`}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
