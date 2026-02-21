'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl, getLogoUrl } from '@/lib/tmdb.client';
import type { MovieDetails, Movie } from '@/lib/tmdb';
import Image from 'next/image';
import { Loader2, Play, Star, Bookmark, Calendar, Clock, ChevronLeft, Share2, TrendingUp, Users, Award, Clapperboard, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveMovieToPlaylist, removeMovieFromPlaylist } from '@/firebase/firestore/playlists';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { MovieCarousel } from '@/components/movie-carousel';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MovieDetailsWithMedia extends MovieDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
}

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
    id: number;
}

const getDirectPlatformLink = (providerName: string, title: string) => {
    const query = encodeURIComponent(title);
    switch (providerName.toLowerCase()) {
        case 'netflix': return `https://www.netflix.com/search?q=${query}`;
        case 'amazon prime video':
        case 'amazon prime': return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`;
        case 'disney plus hotstar':
        case 'disney+':
        case 'hotstar': return `https://www.hotstar.com/in/search?q=${query}`;
        case 'jiocinema': return `https://www.jiocinema.com/search/${query}`;
        case 'sony liv': return `https://www.sonyliv.com/search?q=${query}`;
        case 'zee5': return `https://www.zee5.com/search?q=${query}`;
        default: return null;
    }
};

export default function MovieDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDetailsWithMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId, setActiveMedia } = useVideoPlayer();
  const [similarMovies, setSimilarMovies] = useState<MovieWithPoster[]>([]);

  const savedMovieRef = useMemo(() => 
    user && firestore && id ? doc(firestore, `users/${user.uid}/savedMovies/${id}`) : null
  , [firestore, user, id]);
  
  const historyRef = useMemo(() => 
    user && firestore && id ? doc(firestore, `users/${user.uid}/history/${id}`) : null
  , [firestore, user, id]);

  const [savedMovieDoc, isSavedMovieLoading] = useDocumentData(savedMovieRef);
  const [historyDoc] = useDocumentData(historyRef);
  
  const isSaved = !!savedMovieDoc;
  const isPreviouslyWatched = !!historyDoc;

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

  const handlePlayTrailer = (key: string) => setVideoId(key);
  
  const handlePlayNow = () => {
    if (movie) {
      setActiveMedia({ type: 'movie', id: movie.id, title: movie.title, posterPath: movie.poster_path });
    }
  };

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

  const handleShare = async () => {
    if (!movie) return;
    const shareData = {
      title: movie.title,
      text: `Check out ${movie.title} on LBFC!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied", description: "Movie link copied to clipboard." });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-background">
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
  const tmdbWatchLink = movie['watch/providers']?.results?.IN?.link;
  const directors = movie.credits.crew.filter(person => person.job === 'Director');

  return (
    <div className="relative min-h-svh bg-background">
      <div className="relative h-[65vh] md:h-[90vh] w-full overflow-hidden">
        {movie.backdropUrl && (
            <Image 
                src={movie.backdropUrl} 
                alt={movie.title} 
                fill 
                className="object-cover transition-transform duration-1000 scale-105" 
                priority 
                unoptimized
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-transparent to-transparent hidden md:block" />
        
        <div className="absolute top-6 left-4 md:left-8 z-20">
            <Button onClick={() => window.history.back()} variant="ghost" className="glass-card rounded-full gap-2 text-white hover:bg-primary transition-all px-4 md:px-6 py-4 md:py-6 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                <ChevronLeft className="size-4 md:size-5" /> Back
            </Button>
        </div>

        <div className="absolute bottom-[50%] left-4 md:left-12 lg:left-24 max-w-4xl z-20 pointer-events-none">
            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <Badge className="bg-primary font-black uppercase text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-sm shadow-lg shadow-primary/20">Featured Cinema</Badge>
                    <div className="flex items-center gap-1 md:gap-1.5 text-yellow-400 font-black text-[10px] md:text-sm bg-black/60 backdrop-blur-xl px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Star className="size-3 md:size-4 fill-current" />
                        {movie.vote_average.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400 font-black text-[10px] md:text-sm bg-black/60 backdrop-blur-xl px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Award className="size-3 md:size-4" />
                        {Math.round(movie.popularity)}
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white font-bold backdrop-blur-md uppercase tracking-widest text-[8px] md:text-[10px]">ULTRA HD 4K</Badge>
                </div>
                <h1 className="font-headline text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
                    {movie.title}
                </h1>
            </div>
        </div>
      </div>

      <div className="content-container relative -mt-40 pb-20 z-30 px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20">
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6 md:space-y-10">
            <div className="relative aspect-[2/3] w-[220px] md:w-full mx-auto md:mx-0 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border-2 border-white/10 glass-card group">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" className="rounded-full h-16 w-16 md:h-24 md:w-24 p-0 border-white/20 bg-primary/20 backdrop-blur-md hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500" onClick={handlePlayNow}>
                        <Play className="size-8 md:size-12 fill-current ml-1" />
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-5">
                <Button onClick={handlePlayNow} size="lg" className="rounded-2xl md:rounded-[2.5rem] h-14 md:h-20 font-black text-lg md:text-2xl shadow-2xl shadow-primary/30 group bg-primary text-white hover:bg-primary/90">
                    <Play className="mr-2 md:mr-3 size-5 md:size-7 fill-current transition-transform group-hover:scale-110" /> 
                    {isPreviouslyWatched ? 'Resume Movie' : 'Play Now'}
                </Button>
                <div className="flex gap-3 md:gap-4">
                    <Button onClick={() => trailer && handlePlayTrailer(trailer.key)} variant="outline" className="flex-1 rounded-2xl md:rounded-[2.5rem] h-14 md:h-20 border-white/10 glass-card text-sm md:text-xl font-bold transition-all hover:scale-105 active:scale-95" disabled={!trailer}>
                        <Clapperboard className="mr-2 md:mr-3 size-5 md:size-7" /> Trailer
                    </Button>
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-2xl md:rounded-[2.5rem] h-14 md:h-20 border-white/10 glass-card text-sm md:text-xl font-bold transition-all hover:scale-105 active:scale-95" disabled={isSavedMovieLoading}>
                        <Bookmark className={cn("mr-2 md:mr-3 size-5 md:size-7 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Playlist' : 'Save Title'}
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="rounded-2xl md:rounded-[2.5rem] h-14 w-14 md:h-20 md:w-20 glass-card border-white/10 hover:bg-white hover:text-black transition-colors flex-shrink-0">
                        <Share2 className="size-5 md:size-7" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 border-white/5 shadow-2xl bg-secondary/10">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg md:rounded-xl"><TrendingUp className="size-3 md:size-4" /></div>
                            Stream Now
                        </h3>
                        {tmdbWatchLink && (
                            <a href={tmdbWatchLink} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                                Source Details <ExternalLink className="size-2" />
                            </a>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-5">
                        {streamingProviders.map(provider => {
                            const directLink = getDirectPlatformLink(provider.provider_name, movie.title);
                            return (
                                <a 
                                    key={provider.provider_id} 
                                    href={directLink || tmdbWatchLink || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    title={`Watch on ${provider.provider_name}`} 
                                    className="relative size-12 md:size-16 rounded-xl md:rounded-[1.25rem] overflow-hidden shadow-2xl hover:scale-110 hover:ring-4 ring-primary/50 transition-all cursor-pointer border border-white/10"
                                >
                                    <Image src={getLogoUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                                </a>
                            );
                        })}
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase font-bold text-center opacity-50">Direct handoff to official platform catalogs.</p>
                </div>
            )}
          </div>

          <div className="flex-1 space-y-10 md:space-y-16">
            <div className="space-y-6 md:space-y-10">
                <header className="space-y-6 md:space-y-8">
                    <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[10px] md:text-sm font-bold">
                        <div className="flex items-center gap-4 md:gap-8 bg-white/5 px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-[2rem] border border-white/10 backdrop-blur-md text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 md:size-5 text-primary" />
                                <span className="tracking-tight">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 md:size-5 text-primary" />
                                <span className="tracking-tight">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {movie.genres.slice(0, 4).map(g => (
                                <Badge key={g.id} variant="secondary" className="rounded-lg md:rounded-2xl px-3 md:px-8 py-1.5 md:py-3 glass-panel font-black border-white/5 text-[8px] md:text-[11px] uppercase tracking-widest hover:bg-primary transition-colors cursor-default">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl space-y-6 md:space-y-10">
                    <div className="relative">
                        <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-1 md:w-2 bg-primary rounded-full shadow-[0_0_20px_rgba(255,0,0,0.6)]" />
                        <p className="text-xl md:text-6xl font-headline font-medium text-white/95 leading-[1.1] italic drop-shadow-2xl pl-4 md:pl-8">
                            "{movie.tagline || "Every masterpiece has its secrets."}"
                        </p>
                    </div>
                    <p className="text-base md:text-2xl text-muted-foreground/90 leading-relaxed font-medium max-w-4xl">
                        {movie.overview}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-16 pt-6 md:pt-12">
                <section className="space-y-6 md:space-y-10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Users className="size-5 md:size-6 text-primary" />
                            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase mb-0">Cast & Crew</h2>
                        </div>
                        <Badge variant="outline" className="rounded-full border-white/20 text-muted-foreground text-[8px] md:text-[10px] font-black uppercase">Top Credits</Badge>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        {directors.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">Director</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    {directors.slice(0, 2).map(director => (
                                        <Link href={`/person/${director.id}`} key={director.credit_id} className="flex items-center gap-3 md:gap-4 p-3 md:p-5 glass-panel rounded-xl md:rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group shadow-2xl">
                                            <Avatar className="size-10 md:size-16 border-2 border-primary/50 group-hover:border-primary transition-all">
                                                <AvatarImage src={getPosterUrl(director.profile_path)!} />
                                                <AvatarFallback className="bg-secondary text-primary font-bold">{director.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm md:text-lg font-black text-white group-hover:text-primary transition-colors leading-none">{director.name}</p>
                                                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold mt-1.5">Production Lead</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Featured Cast</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {movie.credits.cast.slice(0, 8).map(person => (
                                    <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-3 md:gap-4 p-3 md:p-5 glass-panel rounded-xl md:rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group shadow-xl">
                                        <Avatar className="size-10 md:size-16 border-2 border-white/10 group-hover:border-primary transition-all">
                                            <AvatarImage src={getPosterUrl(person.profile_path)!} />
                                            <AvatarFallback className="bg-secondary text-primary font-bold">{person.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="text-sm md:text-lg font-black text-white group-hover:text-primary transition-colors leading-none truncate">{person.name}</p>
                                            <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold mt-1.5 truncate tracking-wider">{person.character}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
          </div>
        </div>
        
        {similarMovies.length > 0 && (
            <div className="mt-20 md:mt-40 pt-10 md:pt-20 border-t border-white/10">
                <MovieCarousel title="You Might Also Enjoy" movies={similarMovies} />
            </div>
        )}
      </div>
    </div>
  );
}
