
'use client';

import React, { useState, useEffect } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { MovieDetails, CastMember, CrewMember, Review, WatchProvider } from '@/lib/tmdb';
import { getMovieTrivia } from '@/ai/flows/movie-trivia';
import { getExternalRatings } from '@/ai/flows/get-external-ratings';
import { AppLayout } from '@/components/layout/app-layout';
import Image from 'next/image';
import { Loader2, PlayCircle, Star, MessageSquareQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';
import { MovieRating } from '@/components/movie-rating';
import { useUser } from '@/firebase/auth/auth-client';
import { UserReviewsSection } from '@/components/user-reviews-section';

interface MovieDetailsWithMedia extends MovieDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
}

interface Trivia {
    behindTheScenes: string[];
    trivia: string[];
    goofs: string[];
}

interface ExternalRatings {
    imdb: string;
    rottenTomatoes: string;
}

const RottenTomatoesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.17 14.83c-.39.39-1.02.39-1.41 0L12 15.41l-1.76 1.42c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.42-1.76-1.42-1.76c-.39-.39-.39-10.2 0-1.41.39-.39 1.02-.39 1.41 0l1.76 1.42 1.76-1.42c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-1.42 1.76 1.42 1.76c.39.39.39 1.02 0 1.41z" fill="#FA320A"/>
    </svg>
);

const ImdbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <rect width="48" height="24" rx="4" fill="#F5C518"/>
    <path d="M8 6H11V18H8V6Z" fill="black"/>
    <path d="M15.2 6H19.4L16.4 13.8L15.2 18H12L14.6 11.4L13.4 6H15.2Z" fill="black"/>
    <path d="M21.6 6H24.6C26.4 6 27.6 6.9 27.6 9C27.6 10.5 26.7 11.4 25.5 11.7L28.2 18H24.9L22.8 12.3H24V8.4H22.2L21.6 6ZM24 8.4V10.2C25.2 10.2 25.5 9.9 25.5 9C25.5 8.1 25.2 8.4 24 8.4Z" fill="black"/>
    <path d="M31 6H39V8.1H35.5V18H32.5V8.1H31V6Z" fill="black"/>
  </svg>
);

export default function MovieDetailsPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const id = params.id;
  const { user } = useUser();
  const [movie, setMovie] = useState<MovieDetailsWithMedia | null>(null);
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [externalRatings, setExternalRatings] = useState<ExternalRatings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId } = useVideoPlayer();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const movieId = parseInt(id, 10);
        const movieDetails = await getMovieDetails(movieId);
        
        const movieWithMedia = {
          ...movieDetails,
          posterUrl: getPosterUrl(movieDetails.poster_path),
          backdropUrl: getBackdropUrl(movieDetails.backdrop_path),
        };
        setMovie(movieWithMedia);

        const [triviaResult, ratingsResult] = await Promise.all([
            getMovieTrivia({ movieTitle: movieDetails.title }),
            getExternalRatings({ movieTitle: movieDetails.title })
        ]);
        
        setTrivia(triviaResult);
        setExternalRatings(ratingsResult);

      } catch (error) {
        console.error("Failed to fetch movie details or trivia", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handlePlayTrailer = () => {
    const trailer = movie?.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
    if (trailer) {
      setVideoId(trailer.key);
    }
  };
  
  const getAverageRating = () => {
    if (!externalRatings) return null;
    const imdbScore = parseFloat(externalRatings.imdb.split('/')[0]);
    const rtScore = parseInt(externalRatings.rottenTomatoes.replace('%', ''));

    if (isNaN(imdbScore) || isNaN(rtScore)) return null;

    const average = (imdbScore * 10 + rtScore) / 2;
    return `${average.toFixed(0)}%`;
  }
  
  const usProviders = movie?.['watch/providers']?.results?.US;
  const streamingProviders = usProviders?.flatrate || [];

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
  
  const renderReviews = (reviews: Review[], maxItems = 3) => (
    <div className="space-y-4">
        {reviews.slice(0, maxItems).map(review => (
            <Card key={review.id} className="bg-card/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={review.author_details.avatar_path ? getPosterUrl(review.author_details.avatar_path) : undefined} />
                            <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{review.author}</p>
                            {review.author_details.rating && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span>{review.author_details.rating} / 10</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80 line-clamp-4 italic">"{review.content}"</p>
                </CardContent>
            </Card>
        ))}
    </div>
  );

  return (
    <AppLayout>
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
             {streamingProviders.length > 0 && (
                <Card className="mt-4 bg-secondary">
                    <CardHeader>
                        <CardTitle className="text-base">Where to Watch</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {streamingProviders.map(provider => (
                            <div key={provider.provider_id} title={provider.provider_name}>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getPosterUrl(provider.logo_path)} alt={provider.provider_name} />
                                    <AvatarFallback>{provider.provider_name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="w-full md:w-3/4 space-y-6">
            <header className="space-y-2">
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">{movie.title}</h1>
              <p className="text-muted-foreground text-lg">{movie.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => <Badge key={genre.id} variant="secondary">{genre.name}</Badge>)}
              </div>
            </header>
            
            {user && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Your Rating</h3>
                <MovieRating movieId={movie.id} />
              </div>
            )}

            <p className="text-foreground/80 leading-relaxed">{movie.overview}</p>
            
            <div className="flex items-center flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2" title="TMDB User Score">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 10</span>
                </div>

                {externalRatings && (
                    <>
                        <div className="flex items-center gap-2" title="IMDb Rating">
                           <ImdbIcon />
                           <span className="font-bold text-lg">{externalRatings.imdb}</span>
                        </div>
                        <div className="flex items-center gap-2" title="Rotten Tomatoes Score">
                           <RottenTomatoesIcon />
                           <span className="font-bold text-lg">{externalRatings.rottenTomatoes}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-secondary" title="Average Critic Score">
                            <span className="text-xs font-bold text-muted-foreground">AVG</span>
                            <span className="font-bold text-lg">{getAverageRating()}</span>
                        </div>
                    </>
                )}

                <span className="text-muted-foreground hidden md:inline">&#8226;</span>
                <span className="text-muted-foreground">{new Date(movie.release_date).getFullYear()}</span>
                 <span className="text-muted-foreground">&#8226;</span>
                <span className="text-muted-foreground">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>

            <section className="space-y-4 pt-8">
              <h2 className="font-headline text-2xl font-bold">Cast</h2>
              {renderCreditList(movie.credits.cast)}
            </section>
            
            {movie.reviews && movie.reviews.results.length > 0 && (
                <section className="space-y-4 pt-8">
                    <h2 className="font-headline text-2xl font-bold">Critical Acclaim (from TMDB)</h2>
                    {renderReviews(movie.reviews.results)}
                </section>
            )}

            <UserReviewsSection movieId={movie.id} />

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
