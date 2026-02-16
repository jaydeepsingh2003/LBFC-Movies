
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { MovieDetails, Movie } from '@/lib/tmdb';
import { getMovieTrivia } from '@/ai/flows/movie-trivia';
import { getExternalRatings } from '@/ai/flows/get-external-ratings';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Play, Star, Bookmark, Calendar, Clock, ChevronLeft, Share2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    id: number;
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

export default function MovieDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
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

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      window.scrollTo(0, 0);
      try {
        const movieId = parseInt(id, 10);
        const movieDetails = await getMovieDetails(movieId);
        
        const movieWithMedia = {
          ...movieDetails,
          posterUrl: getPosterUrl(movieDetails.poster_path),
          backdropUrl: getBackdropUrl(movieDetails.backdrop_path),
        };
        setMovie(movieWithMedia);

        const similarMoviesPromises = movieDetails.similar.results.slice(0, 12).map(async (m) => {
            return {
                ...m,
                posterUrl: getPosterUrl(m.poster_path),
                title: m.title,
            } as MovieWithPoster;
        });

        Promise.all(similarMoviesPromises).then(movies => {
            setSimilarMovies(movies.filter(m => m.posterUrl));
        });

        // Dynamic fetching of AI metadata
        try {
            const [triviaResult, ratingsResult] = await Promise.all([
                getMovieTrivia({ movieTitle: movieDetails.title }),
                getExternalRatings({ movieTitle: movieDetails.title })
            ]);
            setTrivia(triviaResult);
            setExternalRatings(ratingsResult);
        } catch (aiError) {
            console.warn("AI Metadata retrieval skipped or failed", aiError);
        }

      } catch (error) {
        console.error("Failed to fetch movie details", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handlePlayVideo = (key: string) => setVideoId(key);
  
  const handleSaveToggle = async () => {
    if (!user || !firestore || !movie) {
        toast({ variant: "destructive", title: "Sign in required", description: "You need an account to curate your playlist." });
        return;
    }
    try {
        if (isSaved) {
            await removeMovieFromPlaylist(firestore, user.uid, movie.id);
            toast({ title: "Removed from Playlist" });
        } else {
            await saveMovieToPlaylist(firestore, user.uid, { id: movie.id, title: movie.title, overview: movie.overview, poster_path: movie.poster_path });
            toast({ title: "Added to Playlist" });
        }
    } catch (error) {
        console.error("Error toggling save:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Scanning the Archives...</p>
      </div>
    );
  }

  if (!movie) return <div className="text-center py-20 font-headline text-2xl font-bold">Content unavailable.</div>;

  const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) || movie.videos.results[0];
  const streamingProviders = movie['watch/providers']?.results?.IN?.flatrate || [];

  return (
    <div className="relative min-h-screen">
      {/* Backdrop Section */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        {movie.backdropUrl && <Image src={movie.backdropUrl} alt={movie.title} fill className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden md:block" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
            <Button onClick={() => window.history.back()} variant="ghost" className="glass-card rounded-full gap-2 text-white hover:bg-primary transition-all">
                <ChevronLeft className="size-5" /> Back
            </Button>
        </div>
      </div>

      <div className="content-container relative -mt-32 md:-mt-48 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Poster & Actions Sidebar */}
          <div className="w-full lg:w-[350px] flex-shrink-0 space-y-6">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 glass-card group">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailer && (
                        <Button variant="outline" className="rounded-full h-16 w-16 p-0 border-white/20 bg-white/10 backdrop-blur-md" onClick={() => handlePlayVideo(trailer.key)}>
                            <Play className="size-8 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                <Button onClick={() => trailer && handlePlayVideo(trailer.key)} disabled={!trailer} size="lg" className="rounded-xl h-14 font-black text-lg shadow-xl shadow-primary/20">
                    <Play className="mr-3 fill-current" /> Watch Trailer
                </Button>
                <div className="flex gap-3">
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-xl h-14 border-white/10 glass-card" disabled={isSavedMovieLoading}>
                        <Bookmark className={cn("mr-2 size-5", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In List' : 'Add to List'}
                    </Button>
                    <Button variant="outline" className="rounded-xl h-14 w-14 glass-card border-white/10">
                        <Share2 className="size-5" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Info className="size-4" /> Available on
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {streamingProviders.map(provider => (
                            <div key={provider.provider_id} title={provider.provider_name} className="relative size-12 rounded-xl overflow-hidden shadow-lg hover:scale-110 transition-transform">
                                <Image src={getPosterUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Main Info Section */}
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
                <header className="space-y-4">
                    <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                        {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                        <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                            <Star className="size-4 fill-current" />
                            <span>{movie.vote_average.toFixed(1)} TMDB</span>
                        </div>

                        {externalRatings && (
                            <>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                   <ImdbIcon />
                                   <span>{externalRatings.imdb}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                   <RottenTomatoesIcon />
                                   <span>{externalRatings.rottenTomatoes}</span>
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                            <Calendar className="size-4" />
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                            <Clock className="size-4" />
                            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                        </div>
                        {movie.genres.slice(0, 3).map(g => (
                            <Badge key={g.id} variant="secondary" className="rounded-full px-4 py-1.5 glass-card font-bold border-none">
                                {g.name}
                            </Badge>
                        ))}
                    </div>
                </header>

                <div className="max-w-3xl">
                    <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                        {movie.tagline || "A cinematic masterpiece waiting to be explored."}
                    </p>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-medium">
                        {movie.overview}
                    </p>
                </div>
            </div>

            {/* Director & Cast Sub-section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <section className="space-y-6">
                    <h2 className="section-title">Director & Cast</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {movie.credits.cast.slice(0, 6).map(person => (
                            <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-4 p-3 glass-panel rounded-xl hover:bg-white/10 transition-all group">
                                <Avatar className="size-14 border-2 border-white/10 group-hover:border-primary transition-colors">
                                    <AvatarImage src={getPosterUrl(person.profile_path)!} />
                                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate">{person.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="section-title">Your Verdict</h2>
                    <div className="glass-panel rounded-2xl p-8 space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Rate this Title</p>
                            <div className="flex justify-center py-2">
                                <MovieRating movieId={movie.id} />
                            </div>
                        </div>
                        <Separator className="bg-white/5" />
                        <UserReviewsSection movieId={movie.id} />
                    </div>
                </section>
            </div>

            {/* AI Trivia Section */}
            {trivia && (
                <section className="space-y-8 glass-panel rounded-3xl p-8 md:p-12">
                    <h2 className="section-title">Director's Cut & Trivia</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trivia.trivia.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-black text-primary uppercase text-xs tracking-[0.2em]">Fun Facts</h3>
                                <ul className="space-y-4">
                                    {trivia.trivia.slice(0, 3).map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground font-medium leading-relaxed">• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {trivia.behindTheScenes.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-black text-primary uppercase text-xs tracking-[0.2em]">The Production</h3>
                                <ul className="space-y-4">
                                    {trivia.behindTheScenes.slice(0, 3).map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground font-medium leading-relaxed">• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {trivia.goofs.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-black text-primary uppercase text-xs tracking-[0.2em]">Cinema Goofs</h3>
                                <ul className="space-y-4">
                                    {trivia.goofs.slice(0, 3).map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground font-medium leading-relaxed">• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}
          </div>
        </div>
        
        {similarMovies.length > 0 && (
            <div className="mt-20">
                <MovieCarousel title="Titles You Might Love" movies={similarMovies} />
            </div>
        )}
      </div>
    </div>
  );
}
