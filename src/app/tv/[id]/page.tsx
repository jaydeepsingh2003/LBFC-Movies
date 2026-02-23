'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTvShowDetails, getPosterUrl, getBackdropUrl, getLogoUrl } from '@/lib/tmdb.client';
import type { TVShowDetails } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Tv, Bookmark, ChevronLeft, Calendar, TrendingUp, Layers, LayoutGrid, Users, Award, Share2, Play, ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveTvShowToPlaylist, removeTvShowFromPlaylist } from '@/firebase/firestore/tv-playlists';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TVShowDetailsWithMedia extends TVShowDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
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

export default function TVShowDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [show, setShow] = useState<TVShowDetailsWithMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId, setActiveMedia } = useVideoPlayer();

  const savedShowRef = useMemo(() => 
    user && firestore && id ? doc(firestore, `users/${user.uid}/savedTvShows/${id}`) : null
  , [firestore, user, id]);
  
  const historyRef = useMemo(() => 
    user && firestore && id ? doc(firestore, `users/${user.uid}/history/${id}`) : null
  , [firestore, user, id]);

  const [savedShowDoc, isSavedShowLoading] = useDocumentData(savedShowRef);
  const [historyDoc] = useDocumentData(historyRef);
  
  const isSaved = !!savedShowDoc;
  const isPreviouslyWatched = !!historyDoc;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      window.scrollTo(0, 0);
      try {
        const showId = parseInt(id, 10);
        const showDetails = await getTvShowDetails(showId);
        
        const showWithMedia = {
          ...showDetails,
          posterUrl: getPosterUrl(showDetails.poster_path),
          backdropUrl: getBackdropUrl(showDetails.backdrop_path),
        };
        setShow(showWithMedia);

      } catch (error) {
        console.error("Failed to fetch tv show details", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handlePlayTrailer = () => {
    const trailer = show?.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
    if (trailer) {
      setVideoId(trailer.key);
    }
  };

  const handlePlayNow = (season: number = 1, episode: number = 1) => {
    if (show) {
      setActiveMedia({ 
        type: 'tv', 
        id: show.id, 
        title: show.name, 
        posterPath: show.poster_path, 
        season, 
        episode 
      });
    }
  };

  const handleSaveToggle = async () => {
    if (!user || !firestore || !show) {
        toast({ variant: "destructive", title: "Sign in required", description: "Please log in to curate your TV collection." });
        return;
    }
    try {
        if (isSaved) {
            await removeTvShowFromPlaylist(firestore, user.uid, show.id);
            toast({ title: "Removed from TV Vault" });
        } else {
            await saveTvShowToPlaylist(firestore, user.uid, { id: show.id, name: show.name, overview: show.overview, poster_path: show.poster_path });
            toast({ title: "Saved to TV Vault" });
        }
    } catch (error) {
        console.error("Error toggling save state:", error);
    }
  };

  const handleShare = async () => {
    if (!show) return;
    const shareData = {
      title: show.name,
      text: `Check out ${show.name} on CINEVEXIA!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied", description: "Series link copied to clipboard." });
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
        <p className="text-muted-foreground font-black tracking-[0.5em] uppercase text-xs animate-pulse">Retrieving Series Intel...</p>
      </div>
    );
  }

  if (!show) return <div className="text-center py-20 font-headline text-2xl font-black uppercase text-white">Series Unavailable</div>;

  const trailerAvailable = !!show?.videos?.results?.find(v => v.type === 'Trailer');
  const streamingProviders = show?.['watch/providers']?.results?.IN?.flatrate || [];
  const tmdbWatchLink = show?.['watch/providers']?.results?.IN?.link;

  return (
    <div className="relative min-h-svh bg-background pb-24">
      {/* Immersive Backdrop Tier */}
      <div className="relative h-[65vh] md:h-[95vh] w-full overflow-hidden">
        {show.backdropUrl && (
            <Image 
                src={show.backdropUrl} 
                alt={show.name} 
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

        <div className="absolute bottom-[35%] md:bottom-[40%] left-4 md:left-12 lg:left-24 max-w-5xl z-20 pointer-events-none">
            <div className="space-y-4 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <Badge className="bg-primary text-white font-black uppercase text-[8px] md:text-[10px] px-3 md:px-4 py-1 md:py-1.5 rounded-sm shadow-2xl shadow-primary/20 flex items-center gap-2">
                        <ShieldCheck className="size-2.5 md:size-3" /> Original Series
                    </Badge>
                    <div className="flex items-center gap-1.5 md:gap-2 text-yellow-400 font-black text-[10px] md:text-sm bg-black/60 backdrop-blur-3xl px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Star className="size-3 md:size-4 fill-current" />
                        {show.vote_average.toFixed(1)} <span className="hidden sm:inline text-muted-foreground font-medium text-[10px] ml-1">Series Grade</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white font-black backdrop-blur-md uppercase tracking-[0.3em] text-[8px] md:text-[9px] px-3 md:px-4 py-1 md:py-1.5">ULTRA HD 4K</Badge>
                </div>
                <h1 className="font-headline text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9] md:leading-[0.85] drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] uppercase break-words">
                    {show.name}
                </h1>
            </div>
        </div>
      </div>

      <div className="relative -mt-24 md:-mt-64 z-30 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-24">
          {/* Sidebar Tier */}
          <div className="w-full lg:w-[450px] flex-shrink-0 space-y-8 md:space-y-12">
            <div className="relative aspect-[2/3] w-[240px] sm:w-[320px] md:w-full mx-auto md:mx-0 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)] border-2 border-white/10 glass-card group">
                {show.posterUrl && <Image src={show.posterUrl} alt={show.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-700 shadow-[0_0_50px_rgba(225,29,72,0.4)]">
                        <Play className="size-10 md:size-16 fill-current text-white ml-2" />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <Button onClick={() => handlePlayNow()} size="lg" className="rounded-2xl md:rounded-3xl h-16 md:h-24 font-black text-lg md:text-3xl shadow-2xl shadow-primary/30 group bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 uppercase tracking-tighter">
                    <Play className="mr-3 md:mr-4 size-6 md:size-10 fill-current transition-transform group-hover:scale-110" /> 
                    {isPreviouslyWatched ? 'Resume Cycle' : 'Start Series'}
                </Button>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Button onClick={handlePlayTrailer} variant="outline" className="rounded-xl md:rounded-2xl h-14 md:h-20 border-white/10 glass-panel text-[10px] md:text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" disabled={!trailerAvailable}>
                        <PlayCircle className="mr-2 size-4 md:size-5" /> Trailer
                    </Button>
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="rounded-xl md:rounded-2xl h-14 md:h-20 border-white/10 glass-panel text-[10px] md:text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" disabled={isSavedShowLoading}>
                        <Bookmark className={cn("mr-2 size-4 md:size-5 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Vault' : 'Save Series'}
                    </Button>
                </div>
                <Button onClick={handleShare} variant="outline" className="w-full rounded-xl md:rounded-2xl h-14 md:h-20 glass-panel border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px]">
                    <Share2 className="mr-2 size-4" /> Share Transmission
                </Button>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 border-white/5 shadow-2xl bg-secondary/5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary flex items-center gap-2 md:gap-3">
                                <TrendingUp className="size-3 md:size-4" /> Stream Hub
                            </h3>
                            <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase">Official Platform Links</p>
                        </div>
                        {tmdbWatchLink && (
                            <a href={tmdbWatchLink} target="_blank" rel="noopener noreferrer" className="size-8 md:size-10 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
                                <ExternalLink className="size-3 md:size-4 text-muted-foreground" />
                            </a>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                        {streamingProviders.map(provider => {
                            const directLink = getDirectPlatformLink(provider.provider_name, show.name);
                            return (
                                <a 
                                    key={provider.provider_id} 
                                    href={directLink || tmdbWatchLink || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    title={`Watch on ${provider.provider_name}`} 
                                    className="relative size-12 md:size-20 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl hover:scale-110 hover:ring-4 ring-primary/50 transition-all cursor-pointer border border-white/10"
                                >
                                    <Image src={getLogoUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>

          {/* Main Content Tier */}
          <div className="flex-1 space-y-12 lg:space-y-16 lg:pt-16">
            <div className="space-y-8 md:space-y-12">
                <header className="space-y-8 md:space-y-10">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-4 md:gap-8 bg-secondary/40 px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                            <div className="flex items-center gap-2 md:gap-3">
                                <Calendar className="size-4 md:size-5 text-primary" />
                                <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'} Start</span>
                            </div>
                            <Separator orientation="vertical" className="h-4 md:h-6 bg-white/10" />
                            <div className="flex items-center gap-2 md:gap-3">
                                <LayoutGrid className="size-4 md:size-5 text-primary" />
                                <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">{show.number_of_seasons} Full Cycles</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {show.genres.slice(0, 4).map(g => (
                                <Badge key={g.id} variant="secondary" className="rounded-full px-4 md:px-8 py-2 md:py-4 glass-panel font-black border-white/5 text-[8px] md:text-[10px] uppercase tracking-widest md:tracking-[0.2em] hover:bg-primary transition-all cursor-default shadow-xl">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-5xl space-y-6 md:space-y-10">
                        <div className="relative">
                            <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-1 md:w-2 bg-primary rounded-full shadow-[0_0_30px_rgba(225,29,72,0.8)]" />
                            <p className="text-xl sm:text-3xl md:text-5xl lg:text-7xl font-headline font-medium text-white/95 leading-[1.1] md:leading-[1.05] italic drop-shadow-2xl pl-6 md:pl-10 tracking-tight">
                                "{show.tagline || "The narrative evolves with every episode."}"
                            </p>
                        </div>
                        <p className="text-base md:text-2xl lg:text-3xl text-muted-foreground/90 leading-relaxed font-medium max-w-5xl">
                            {show.overview}
                        </p>
                    </div>
                </header>
            </div>

            <div className="grid grid-cols-1 gap-16 md:gap-20">
                {/* Cast Section */}
                <section className="space-y-8 md:space-y-12">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6 md:pb-8">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20 shadow-2xl">
                                <Users className="size-6 md:size-8 text-primary" />
                            </div>
                            <div className="space-y-0.5 md:space-y-1">
                                <h2 className="font-headline text-2xl md:text-5xl font-black tracking-tighter uppercase mb-0">Primary <span className="text-primary">Personnel</span></h2>
                                <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-60">The core units participating in this cycle.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {show.credits.cast.slice(0, 9).map(person => (
                            <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-4 md:gap-5 p-4 md:p-5 glass-panel rounded-xl md:rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group shadow-xl">
                                <Avatar className="size-12 md:size-20 border-2 border-white/10 group-hover:border-primary transition-all shadow-xl">
                                    <AvatarImage src={getPosterUrl(person.profile_path)!} className="object-cover" />
                                    <AvatarFallback className="bg-secondary text-primary font-black">{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden space-y-0.5 md:space-y-1">
                                    <p className="text-base md:text-lg font-black text-white group-hover:text-primary transition-colors leading-tight truncate uppercase tracking-tighter">{person.name}</p>
                                    <p className="text-[8px] md:text-[9px] text-muted-foreground truncate uppercase font-bold tracking-widest">{person.character}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Episode Guide Tier */}
                <section className="space-y-8 md:space-y-12">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6 md:pb-8">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20 shadow-2xl">
                                <Layers className="size-6 md:size-8 text-primary" />
                            </div>
                            <div className="space-y-0.5 md:space-y-1">
                                <h2 className="font-headline text-2xl md:text-5xl font-black tracking-tighter uppercase mb-0">Cycle <span className="text-primary">Transmissions</span></h2>
                                <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-60">Full sequence indexing across all seasons.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                        {show.seasons.filter(s => s.season_number > 0).map(season => (
                            <div key={season.id} className="group glass-panel rounded-2xl md:rounded-[3rem] overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-700 shadow-2xl relative">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-10 relative z-10">
                                    <div className="w-full md:w-56 aspect-[2/3] relative flex-shrink-0 rounded-xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] group/poster">
                                        {season.poster_path ? (
                                            <Image src={getPosterUrl(season.poster_path)!} alt={season.name} fill className="object-cover transition-transform group-hover:scale-110 duration-1000" unoptimized />
                                        ) : (
                                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                                                <Tv className="size-12 md:size-16 text-white/10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <Button size="icon" className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-2xl" onClick={() => handlePlayNow(season.season_number, 1)}>
                                                <Play className="size-6 md:size-8 fill-current text-white ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 md:space-y-8">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-1 md:space-y-2">
                                                <h3 className="font-black text-xl md:text-5xl group-hover:text-primary transition-colors leading-tight text-white tracking-tighter uppercase">{season.name}</h3>
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest md:tracking-[0.3em]">{season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'} Sequence</span>
                                                    <Separator orientation="vertical" className="h-3 md:h-4 bg-white/10" />
                                                    <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest md:tracking-[0.3em]">{season.episode_count} Transmissions</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-fit rounded-full px-6 md:px-10 h-10 md:h-14 glass-panel hover:bg-primary transition-all border-white/10 font-black uppercase tracking-widest text-[8px] md:text-[10px]" onClick={() => handlePlayNow(season.season_number, 1)}>
                                                <Play className="mr-2 md:mr-3 size-3 md:size-4 fill-current" />
                                                Initialize Cycle
                                            </Button>
                                        </div>
                                        <p className="text-sm md:text-2xl text-muted-foreground/90 leading-relaxed font-medium line-clamp-3 md:line-clamp-4">
                                            {season.overview || "Production details for this cycle are currently classified. Access will be granted upon transmission."}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
