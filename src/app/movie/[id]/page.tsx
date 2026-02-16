'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { MovieDetails, Movie } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Play, Star, Bookmark, Calendar, Clock, ChevronLeft, Share2, Info, TrendingUp, Sparkles } from 'lucide-react';
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
      <div className="relative h-[65vh] md:h-[80vh] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-transparent to-transparent hidden md:block" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
            <Button onClick={() => window.history.back()} variant="ghost" className="glass-card rounded-full gap-2 text-white hover:bg-primary transition-all px-6 py-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="size-5" /> Back
            </Button>
        </div>

        {/* Header Overlay Info */}
        <div className="absolute bottom-[15%] left-4 md:left-12 lg:left-24 max-w-4xl z-20 pointer-events-none">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-primary font-black uppercase text-[10px] px-3 py-1 rounded-sm shadow-lg shadow-primary/20">Featured Movie</Badge>
                    <div className="flex items-center gap-1.5 text-yellow-400 font-black text-sm bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Star className="size-4 fill-current" />
                        {movie.vote_average.toFixed(1)}
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white font-bold backdrop-blur-md uppercase tracking-widest text-[10px]">4K HDR</Badge>
                </div>
                <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    {movie.title}
                </h1>
            </div>
        </div>
      </div>

      <div className="content-container relative -mt-32 md:-mt-48 pb-20 z-30">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Poster & Actions Sidebar */}
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-10">
            <div className="relative aspect-[2/3] w-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-white/10 glass-card group">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailer && (
                        <Button variant="outline" className="rounded-full h-24 w-24 p-0 border-white/20 bg-white/10 backdrop-blur-md hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500" onClick={() => handlePlayVideo(trailer.key)}>
                            <Play className="size-12 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
                <Button onClick={() => trailer && handlePlayVideo(trailer.key)} disabled={!trailer} size="lg" className="rounded-2xl h-18 font-black text-xl shadow-2xl shadow-primary/30 group">
                    <Play className="mr-3 fill-current transition-transform group-hover:scale-110" /> Watch Trailer
                </Button>
                <div className="flex gap-4">
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-2xl h-18 border-white/10 glass-card text-lg font-bold transition-all hover:scale-105 active:scale-95" disabled={isSavedMovieLoading}>
                        <Bookmark className={cn("mr-3 size-6 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Playlist' : 'Save Title'}
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-18 w-18 glass-card border-white/10 hover:bg-white hover:text-black transition-colors flex-shrink-0">
                        <Share2 className="size-6" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[2.5rem] p-10 space-y-8 border-white/5 shadow-2xl bg-secondary/10">
                    <h3 className="font-black text-xs uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><TrendingUp className="size-4" /></div>
                        Official Broadcasters
                    </h3>
                    <div className="flex flex-wrap gap-5">
                        {streamingProviders.map(provider => (
                            <div key={provider.provider_id} title={provider.provider_name} className="relative size-16 rounded-[1.25rem] overflow-hidden shadow-2xl hover:scale-110 hover:ring-4 ring-primary/50 transition-all cursor-pointer border border-white/10">
                                <Image src={getPosterUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Main Info Section */}
          <div className="flex-1 space-y-16">
            <div className="space-y-10">
                <header className="space-y-8">
                    <div className="flex flex-wrap items-center gap-5 text-sm font-bold">
                        <div className="flex items-center gap-8 bg-white/5 px-8 py-3.5 rounded-[1.5rem] border border-white/10 backdrop-blur-md text-white/80">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="size-5 text-primary" />
                                <span className="tracking-tight">{new Date(movie.release_date).getFullYear()}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="size-5 text-primary" />
                                <span className="tracking-tight">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {movie.genres.slice(0, 4).map(g => (
                                <Badge key={g.id} variant="secondary" className="rounded-xl px-6 py-2.5 glass-panel font-black border-white/5 text-[10px] uppercase tracking-widest hover:bg-primary transition-colors cursor-default">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl space-y-10">
                    <div className="relative">
                        <div className="absolute -left-8 top-0 bottom-0 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                        <p className="text-3xl md:text-5xl font-headline font-medium text-white/95 leading-tight italic drop-shadow-2xl pl-4">
                            "{movie.tagline || "Every masterpiece has its secrets."}"
                        </p>
                    </div>
                    <p className="text-2xl text-muted-foreground/90 leading-relaxed font-medium max-w-4xl">
                        {movie.overview}
                    </p>
                </div>
            </div>

            {/* Director & Cast Sub-section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 pt-12">
                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                        <Sparkles className="size-6 text-primary" />
                        <h2 className="section-title text-4xl font-black tracking-tighter mb-0">Director & Cast</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {movie.credits.cast.slice(0, 8).map(person => (
                            <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-5 p-5 glass-panel rounded-3xl hover:bg-white/10 hover:scale-[1.02] transition-all group border-white/10 shadow-xl">
                                <Avatar className="size-20 border-4 border-white/10 group-hover:border-primary transition-all shadow-2xl">
                                    <AvatarImage src={getPosterUrl(person.profile_path)!} />
                                    <AvatarFallback className="bg-secondary text-primary font-black text-xl">{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="font-black text-lg truncate group-hover:text-primary transition-colors text-white">{person.name}</p>
                                    <p className="text-xs text-muted-foreground truncate uppercase font-bold tracking-[0.15em] mt-1">{person.character}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                        <Star className="size-6 text-primary fill-primary" />
                        <h2 className="section-title text-4xl font-black tracking-tighter mb-0">Community Hub</h2>
                    </div>
                    <div className="glass-panel rounded-[3rem] p-12 space-y-12 border-white/10 bg-secondary/30 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                        
                        <div className="space-y-6 relative z-10">
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground text-center">Architect your rating</p>
                            <div className="flex justify-center py-4 scale-150">
                                <MovieRating movieId={movie.id} />
                            </div>
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="relative z-10">
                            <UserReviewsSection movieId={movie.id} />
                        </div>
                    </div>
                </section>
            </div>
          </div>
        </div>
        
        {similarMovies.length > 0 && (
            <div className="mt-40 pt-20 border-t border-white/10">
                <MovieCarousel title="You Might Also Enjoy" movies={similarMovies} />
            </div>
        )}
      </div>
    </div>
  );
}
