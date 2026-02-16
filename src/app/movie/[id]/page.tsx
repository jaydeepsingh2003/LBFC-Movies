
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { MovieDetails, Movie } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Play, Star, Bookmark, Calendar, Clock, ChevronLeft, Share2, Info, TrendingUp } from 'lucide-react';
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

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
    id: number;
}

export default function MovieDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDetailsWithMedia | null>(null);
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

        const resolvedSimilar = await Promise.all(similarMoviesPromises);
        setSimilarMovies(resolvedSimilar.filter(m => m.posterUrl));

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
      <div className="flex flex-col justify-center items-center h-screen gap-6 bg-background">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Scanning the Archives...</p>
      </div>
    );
  }

  if (!movie) return <div className="text-center py-20 font-headline text-2xl font-bold">Content unavailable.</div>;

  const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) || movie.videos.results[0];
  const streamingProviders = movie['watch/providers']?.results?.IN?.flatrate || [];

  return (
    <div className="relative min-h-screen bg-background">
      {/* Cinematic Backdrop Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        {movie.backdropUrl && (
            <Image 
                src={movie.backdropUrl} 
                alt={movie.title} 
                fill 
                className="object-cover transition-transform duration-1000 scale-105" 
                priority 
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent hidden md:block" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
            <Button onClick={() => window.history.back()} variant="ghost" className="glass-card rounded-full gap-2 text-white hover:bg-primary transition-all px-6 py-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="size-5" /> Back
            </Button>
        </div>

        {/* Header Overlay Info */}
        <div className="absolute bottom-[10%] left-4 md:left-12 lg:left-24 max-w-4xl z-20 pointer-events-none">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex items-center gap-3">
                    <Badge className="bg-primary font-black uppercase text-[10px] px-3 py-1 rounded-sm">Premium</Badge>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                        <Star className="size-4 fill-current" />
                        {movie.vote_average.toFixed(1)}
                    </div>
                </div>
                <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                    {movie.title}
                </h1>
            </div>
        </div>
      </div>

      <div className="content-container relative -mt-32 md:-mt-48 pb-20 z-30">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Poster & Actions Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0 space-y-8">
            <div className="relative aspect-[2/3] w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-white/10 glass-card group">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailer && (
                        <Button variant="outline" className="rounded-full h-20 w-20 p-0 border-white/20 bg-white/10 backdrop-blur-md hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500" onClick={() => handlePlayVideo(trailer.key)}>
                            <Play className="size-10 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <Button onClick={() => trailer && handlePlayVideo(trailer.key)} disabled={!trailer} size="lg" className="rounded-2xl h-16 font-black text-xl shadow-2xl shadow-primary/20 group">
                    <Play className="mr-3 fill-current transition-transform group-hover:scale-110" /> Watch Trailer
                </Button>
                <div className="flex gap-4">
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-2xl h-16 border-white/10 glass-card text-lg font-bold" disabled={isSavedMovieLoading}>
                        <Bookmark className={cn("mr-3 size-6 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In List' : 'Add to List'}
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-16 w-16 glass-card border-white/10 hover:bg-white hover:text-black transition-colors">
                        <Share2 className="size-6" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[2rem] p-8 space-y-6 border-white/5">
                    <h3 className="font-black text-xs uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg"><TrendingUp className="size-4 text-primary" /></div>
                        Available on
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {streamingProviders.map(provider => (
                            <div key={provider.provider_id} title={provider.provider_name} className="relative size-14 rounded-2xl overflow-hidden shadow-2xl hover:scale-110 hover:ring-2 ring-primary transition-all cursor-pointer">
                                <Image src={getPosterUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Main Info Section */}
          <div className="flex-1 space-y-12">
            <div className="space-y-8">
                <header className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                        <div className="flex items-center gap-6 bg-white/5 px-6 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-primary" />
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-primary" />
                                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {movie.genres.slice(0, 3).map(g => (
                                <Badge key={g.id} variant="secondary" className="rounded-xl px-5 py-2 glass-card font-black border-none text-[10px] uppercase tracking-widest hover:bg-primary transition-colors">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl space-y-8">
                    <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary rounded-full" />
                        <p className="text-2xl md:text-4xl font-headline font-medium text-white/95 leading-tight italic drop-shadow-xl pl-2">
                            {movie.tagline || "A cinematic masterpiece waiting to be explored."}
                        </p>
                    </div>
                    <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium">
                        {movie.overview}
                    </p>
                </div>
            </div>

            {/* Director & Cast Sub-section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12">
                <section className="space-y-8">
                    <h2 className="section-title text-3xl font-black tracking-tighter">Director & Cast</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {movie.credits.cast.slice(0, 6).map(person => (
                            <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-5 p-4 glass-panel rounded-2xl hover:bg-white/10 hover:scale-[1.02] transition-all group border-white/5">
                                <Avatar className="size-16 border-2 border-white/10 group-hover:border-primary transition-colors shadow-2xl">
                                    <AvatarImage src={getPosterUrl(person.profile_path)!} />
                                    <AvatarFallback className="bg-secondary text-primary font-bold">{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-base truncate group-hover:text-primary transition-colors">{person.name}</p>
                                    <p className="text-xs text-muted-foreground truncate uppercase font-bold tracking-widest">{person.character}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="space-y-8">
                    <h2 className="section-title text-3xl font-black tracking-tighter">Your Verdict</h2>
                    <div className="glass-panel rounded-[2.5rem] p-10 space-y-10 border-white/5 bg-secondary/20 shadow-2xl backdrop-blur-2xl">
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Rate this Title</p>
                            <div className="flex justify-center py-2 scale-125">
                                <MovieRating movieId={movie.id} />
                            </div>
                        </div>
                        <Separator className="bg-white/5" />
                        <UserReviewsSection movieId={movie.id} />
                    </div>
                </section>
            </div>
          </div>
        </div>
        
        {similarMovies.length > 0 && (
            <div className="mt-32 pt-16 border-t border-white/5">
                <MovieCarousel title="Titles You Might Love" movies={similarMovies} />
            </div>
        )}
      </div>
    </div>
  );
}
