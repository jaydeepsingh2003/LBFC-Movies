'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl, getMovieVideos } from '@/lib/tmdb.client';
import type { MovieDetails, CastMember, CrewMember, Review, Movie, TmdbVideo } from '@/lib/tmdb';
import { getMovieTrivia } from '@/ai/flows/movie-trivia';
import { getExternalRatings } from '@/ai/flows/get-external-ratings';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Bookmark, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';
import { MovieRating } from '@/components/movie-rating';
import { useUser } from '@/firebase/auth/auth-client';
import { UserReviewsSection } from '@/components/user-reviews-section';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveMovieToPlaylist, removeMovieFromPlaylist } from '@/firebase/firestore/playlists';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { MovieCarousel } from '@/components/movie-carousel';

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

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
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
  const { id } = params;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDetailsWithMedia | null>(null);
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [externalRatings, setExternalRatings] = useState<ExternalRatings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId } = useVideoPlayer();
  const [similarMovies, setSimilarMovies] = useState<MovieWithPoster[]>([]);

  const savedMovieRef = useMemo(() => 
    user && firestore && id ? doc(firestore, `users/${user.uid}/savedMovies/${id}`) : null
  , [firestore, user, id]);
  const [savedMovieDoc, isSavedMovieLoading] = useDocumentData(savedMovieRef);
  const isSaved = !!savedMovieDoc;

  const isMovieInTheaters = useMemo(() => {
    if (!movie?.release_date) return false;
    const releaseDate = new Date(movie.release_date);
    const today = new Date();
    const inTheatersUntil = new Date(releaseDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    return releaseDate <= today && today <= inTheatersUntil && movie.status === 'Released';
  }, [movie]);


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setSimilarMovies([]);
      try {
        const movieId = parseInt(id, 10);
        const movieDetails = await getMovieDetails(movieId);
        
        const movieWithMedia = {
          ...movieDetails,
          posterUrl: getPosterUrl(movieDetails.poster_path),
          backdropUrl: getBackdropUrl(movieDetails.backdrop_path),
        };
        setMovie(movieWithMedia);

        const similarMoviesPromises = movieDetails.similar.results.map(async (m) => {
            const videos = await getMovieVideos(m.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            return {
                ...m,
                posterUrl: getPosterUrl(m.poster_path),
                title: m.title,
                trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
            } as MovieWithPoster;
        });

        Promise.all(similarMoviesPromises).then(movies => {
            setSimilarMovies(movies.filter(m => m.posterUrl));
        });

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

  const handlePlayVideo = (key: string) => {
    setVideoId(key);
  };
  
  const handleSaveToggle = async () => {
    if (!user || !firestore || !movie) {
        toast({
            variant: "destructive",
            title: "Please log in",
            description: "You must be logged in to manage your playlist.",
        });
        return;
    }

    try {
        if (isSaved) {
            await removeMovieFromPlaylist(firestore, user.uid, movie.id);
            toast({ title: "Movie removed from your playlist." });
        } else {
            await saveMovieToPlaylist(firestore, user.uid, {
                id: movie.id,
                title: movie.title,
                overview: movie.overview,
                poster_path: movie.poster_path,
            });
            toast({ title: "Movie added to your playlist!" });
        }
    } catch (error) {
        console.error("Error toggling save state:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update your playlist. Please try again.",
        });
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
  
  const trailer = movie?.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
  const musicVideos = movie?.videos.results.filter(v => v.type === 'Music Video' && v.site === 'YouTube');


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-32 w-32 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Movie not found</h2>
        <p className="text-muted-foreground mt-2">We couldn't find details for this movie.</p>
      </div>
    );
  }

  const renderCreditList = (items: (CastMember | CrewMember)[], maxItems = 12) => (
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.slice(0, maxItems).map(item => (
        <Card key={item.credit_id} className="bg-card/50 transition-colors hover:bg-secondary">
          <Link href={`/person/${item.id}`} className="block h-full">
            <CardContent className="p-3 flex items-center gap-3 h-full">
              <Avatar>
                <AvatarImage src={item.profile_path ? getPosterUrl(item.profile_path) : undefined} />
                <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{'character' in item ? item.character : item.job}</p>
              </div>
            </CardContent>
          </Link>
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
    <div className="relative">
      <div className="relative h-96 md:h-[32rem] w-full">
        {movie.backdropUrl && <Image src={movie.backdropUrl} alt={movie.title} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="relative -mt-48 px-4 md:px-8 pb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <Card className="overflow-hidden border-2 border-primary shadow-lg">
              <CardContent className="p-0 aspect-[2/3] relative w-full">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />}
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2 mt-4">
              <Button onClick={() => trailer && handlePlayVideo(trailer.key)} disabled={!trailer} className="w-full" size="lg">
                <PlayCircle className="mr-2" /> Play Trailer
              </Button>
               {user && (
                <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "default"} size="lg" disabled={isSavedMovieLoading}>
                  <Bookmark className={isSaved ? "mr-2 fill-current" : "mr-2"} /> {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}
               {isMovieInTheaters && (
                <Button asChild size="lg">
                  <a href="https://www.district.in/movies/" target="_blank" rel="noopener noreferrer">
                    Book your tickets in District by Zomato
                  </a>
                </Button>
              )}
            </div>
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
            
            {musicVideos && musicVideos.length > 0 && (
                <section className="space-y-4 pt-8">
                    <h2 className="font-headline text-2xl font-bold">Music Videos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {musicVideos.map(video => (
                            <Card key={video.id} className="bg-card/50 hover:bg-secondary transition-colors cursor-pointer" onClick={() => handlePlayVideo(video.key)}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-primary/20 rounded-md">
                                        <Music className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold line-clamp-1">{video.name}</p>
                                        <p className="text-xs text-muted-foreground">Music Video</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

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
        
        {similarMovies.length > 0 && (
            <div className="pt-12">
                <MovieCarousel title="You Might Also Like" movies={similarMovies} />
            </div>
        )}
      </div>
    </div>
  );
}
