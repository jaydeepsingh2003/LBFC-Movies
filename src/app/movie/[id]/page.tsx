'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMovieDetails, getPosterUrl, getBackdropUrl, getLogoUrl } from '@/lib/tmdb.client';
import type { MovieDetails, Movie } from '@/lib/tmdb';
import Image from 'next/image';
import { Loader2, Play, Star, Bookmark, Calendar, Clock, ChevronLeft, Share2, TrendingUp, Users, Award, Clapperboard, ExternalLink, ShieldCheck } from 'lucide-react';
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
      text: `Check out ${movie.title} on CINEVEXIA!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
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
      <div className="flex flex-col justify-center items-center h-svh gap-8 bg-transparent">
        <div className="relative">
            <Loader2 className="h-20 w-20 animate-spin text-primary" />
            <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-[0.5em] uppercase text-xs animate-pulse">Syncing Cinematic Archive...</p>
      </div>
    );
  }

  if (!movie) return <div className="text-center py-20 font-headline text-2xl font-black uppercase text-white">Content Unavailable</div>;

  const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) || movie.videos.results[0];
  const streamingProviders = movie['watch/providers']?.results?.IN?.flatrate || [];
  const tmdbWatchLink = movie['watch/providers']?.results?.IN?.link;
  const directors = movie.credits.crew.filter(person => person.job === 'Director');

  return (
    <div className="relative min-h-svh bg-background pb-24">
      {/* Immersive Backdrop Tier */}
      <div className="relative h-[70vh] md:h-[95vh] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden md:block" />
        
        <div className="absolute top-8 left-4 md:left-12 z-20">
            <Button onClick={() => window.history.back()} variant="ghost" className="glass-panel rounded-full gap-3 text-white hover:bg-primary transition-all px-6 py-6 font-black uppercase tracking-[0.2em] text-[10px] border-white/5">
                <ChevronLeft className="size-4" /> Back
            </Button>
        </div>

        <div className="absolute bottom-[40%] left-4 md:left-12 lg:left-24 max-w-5xl z-20 pointer-events-none">
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-primary text-white font-black uppercase text-[10px] px-4 py-1.5 rounded-sm shadow-2xl shadow-primary/20 flex items-center gap-2">
                        <ShieldCheck className="size-3" /> Featured Cinema
                    </Badge>
                    <div className="flex items-center gap-2 text-yellow-400 font-black text-xs md:text-sm bg-black/60 backdrop-blur-3xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Star className="size-4 fill-current" />
                        {movie.vote_average.toFixed(1)} <span className="text-muted-foreground font-medium text-[10px] ml-1">Archive Grade</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 font-black text-xs md:text-sm bg-black/60 backdrop-blur-3xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Award className="size-4" />
                        {Math.round(movie.popularity)} <span className="text-muted-foreground font-medium text-[10px] ml-1">Rank</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white font-black backdrop-blur-md uppercase tracking-[0.3em] text-[9px] px-4 py-1.5">ULTRA HD 4K</Badge>
                </div>
                <h1 className="font-headline text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] uppercase">
                    {movie.title}
                </h1>
            </div>
        </div>
      </div>

      <div className="content-container relative -mt-64 z-30">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Sidebar Tier */}
          <div className="w-full lg:w-[450px] flex-shrink-0 space-y-12">
            <div className="relative aspect-[2/3] w-[280px] md:w-full mx-auto md:mx-0 rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)] border-2 border-white/10 glass-card group">
                {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-700 shadow-[0_0_50px_rgba(225,29,72,0.4)]">
                        <Play className="size-12 md:size-16 fill-current text-white ml-2" />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <Button onClick={handlePlayNow} size="lg" className="rounded-3xl h-20 md:h-24 font-black text-xl md:text-3xl shadow-2xl shadow-primary/30 group bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 uppercase tracking-tighter">
                    <Play className="mr-4 size-8 md:size-10 fill-current transition-transform group-hover:scale-110" /> 
                    {isPreviouslyWatched ? 'Resume Title' : 'Play Now'}
                </Button>
                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => trailer && handlePlayTrailer(trailer.key)} variant="outline" className="rounded-2xl h-16 md:h-20 border-white/10 glass-panel text-xs md:text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" disabled={!trailer}>
                        <Clapperboard className="mr-2 size-5" /> Trailer
                    </Button>
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="rounded-2xl h-16 md:h-20 border-white/10 glass-panel text-xs md:text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" disabled={isSavedMovieLoading}>
                        <Bookmark className={cn("mr-2 size-5 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Vault' : 'Save Title'}
                    </Button>
                </div>
                <Button onClick={handleShare} variant="outline" className="w-full rounded-2xl h-16 md:h-20 glass-panel border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-[10px]">
                    <Share2 className="mr-2 size-4" /> Share Transmission
                </Button>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[3rem] p-10 space-y-8 border-white/5 shadow-2xl bg-secondary/5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                                <TrendingUp className="size-4" /> Stream Hub
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Official Platform Links</p>
                        </div>
                        {tmdbWatchLink && (
                            <a href={tmdbWatchLink} target="_blank" rel="noopener noreferrer" className="size-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
                                <ExternalLink className="size-4 text-muted-foreground" />
                            </a>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {streamingProviders.map(provider => {
                            const directLink = getDirectPlatformLink(provider.provider_name, movie.title);
                            return (
                                <a 
                                    key={provider.provider_id} 
                                    href={directLink || tmdbWatchLink || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    title={`Watch on ${provider.provider_name}`} 
                                    className="relative size-16 md:size-20 rounded-2xl overflow-hidden shadow-2xl hover:scale-110 hover:ring-4 ring-primary/50 transition-all cursor-pointer border border-white/10"
                                >
                                    <Image src={getLogoUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </a>
                            );
                        })}
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase font-black text-center opacity-40 leading-loose">
                        Encrypted signal handoff to global content nodes.
                    </p>
                </div>
            )}
          </div>

          {/* Main Content Tier */}
          <div className="flex-1 space-y-16 lg:pt-16">
            <div className="space-y-12">
                <header className="space-y-10">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-8 bg-secondary/40 px-10 py-5 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                            <div className="flex items-center gap-3">
                                <Calendar className="size-5 text-primary" />
                                <span className="font-black uppercase tracking-widest text-xs">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                            </div>
                            <Separator orientation="vertical" className="h-6 bg-white/10" />
                            <div className="flex items-center gap-3">
                                <Clock className="size-5 text-primary" />
                                <span className="font-black uppercase tracking-widest text-xs">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {movie.genres.slice(0, 4).map(g => (
                                <Badge key={g.id} variant="secondary" className="rounded-full px-8 py-4 glass-panel font-black border-white/5 text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all cursor-default shadow-xl">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-5xl space-y-10">
                        <div className="relative">
                            <div className="absolute -left-8 top-0 bottom-0 w-2 bg-primary rounded-full shadow-[0_0_30px_rgba(225,29,72,0.8)]" />
                            <p className="text-3xl md:text-7xl font-headline font-medium text-white/95 leading-[1.05] italic drop-shadow-2xl pl-10 tracking-tight">
                                "{movie.tagline || "Every masterpiece has its secrets."}"
                            </p>
                        </div>
                        <p className="text-lg md:text-3xl text-muted-foreground/90 leading-relaxed font-medium max-w-5xl">
                            {movie.overview}
                        </p>
                    </div>
                </header>
            </div>

            <div className="grid grid-cols-1 gap-20">
                {/* Cast & Crew Section */}
                <section className="space-y-12">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl">
                                <Users className="size-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase mb-0">Featured <span className="text-primary">Architects</span></h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">The visionary ensemble behind this cinematic production.</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="hidden sm:flex rounded-full px-6 py-2 border-white/10 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Top Credits</Badge>
                    </div>

                    <div className="space-y-12">
                        {directors.length > 0 && (
                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] ml-2">Production Lead</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {directors.slice(0, 2).map(director => (
                                        <Link href={`/person/${director.id}`} key={director.credit_id} className="flex items-center gap-6 p-6 glass-panel rounded-[2.5rem] hover:bg-white/10 transition-all border border-white/5 group shadow-2xl">
                                            <Avatar className="size-20 md:size-24 border-4 border-primary/40 group-hover:border-primary transition-all shadow-2xl">
                                                <AvatarImage src={getPosterUrl(director.profile_path)!} className="object-cover" />
                                                <AvatarFallback className="bg-secondary text-primary font-black text-2xl">{director.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors leading-none uppercase tracking-tighter">{director.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-2">Film Director</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] ml-2">Primary Personnel</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {movie.credits.cast.slice(0, 9).map(person => (
                                    <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-5 p-5 glass-panel rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group shadow-xl">
                                        <Avatar className="size-16 md:size-20 border-2 border-white/10 group-hover:border-primary transition-all shadow-xl">
                                            <AvatarImage src={getPosterUrl(person.profile_path)!} className="object-cover" />
                                            <AvatarFallback className="bg-secondary text-primary font-black">{person.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden space-y-1">
                                            <p className="text-lg font-black text-white group-hover:text-primary transition-colors leading-none truncate uppercase tracking-tighter">{person.name}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1.5 truncate tracking-widest">{person.character}</p>
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
            <div className="mt-32 pt-20 border-t border-white/5 space-y-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-400/10 rounded-2xl border border-blue-400/20 shadow-2xl">
                        <TrendingUp className="size-8 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase mb-0">Linguistic <span className="text-blue-400">Parity</span></h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Related cinematic works from the global transmission nodes.</p>
                    </div>
                </div>
                <MovieCarousel title="" movies={similarMovies} />
            </div>
        )}
      </div>
    </div>
  );
}
