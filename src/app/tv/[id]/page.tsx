
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTvShowDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { TVShowDetails } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Tv, Bookmark, ChevronLeft, Calendar, TrendingUp, Layers, LayoutGrid, Users } from 'lucide-react';
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
import { TvShowRating } from '@/components/tv-show-rating';
import { TVUserReviewsSection } from '@/components/tv-user-reviews-section';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TVShowDetailsWithMedia extends TVShowDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
}

export default function TVShowDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [show, setShow] = useState<TVShowDetailsWithMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId } = useVideoPlayer();

  const savedShowRef = useMemo(() => 
    user && firestore && id ? doc(firestore, `users/${user.uid}/savedTvShows/${id}`) : null
  , [firestore, user, id]);
  const [savedShowDoc, isSavedShowLoading] = useDocumentData(savedShowRef);
  const isSaved = !!savedShowDoc;

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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-background">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Retrieving Series Intel...</p>
      </div>
    );
  }

  if (!show) return <div className="text-center py-20 font-headline text-2xl font-bold">Show unavailable.</div>;

  const trailerAvailable = !!show?.videos?.results?.find(v => v.type === 'Trailer');
  const streamingProviders = show?.['watch/providers']?.results?.IN?.flatrate || [];

  return (
    <div className="relative min-h-svh bg-background">
      <div className="relative h-[50vh] md:h-[80vh] w-full overflow-hidden">
        {show.backdropUrl && (
            <Image 
                src={show.backdropUrl} 
                alt={show.name} 
                fill 
                className="object-cover transition-transform duration-1000 scale-105" 
                priority 
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-transparent to-transparent hidden md:block" />
        <div className="absolute top-6 left-4 md:left-8 z-20">
            <Button onClick={() => window.history.back()} variant="ghost" className="glass-card rounded-full gap-2 text-white hover:bg-primary transition-all px-4 md:px-6 py-4 md:py-6 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                <ChevronLeft className="size-4 md:size-5" /> Back
            </Button>
        </div>
        <div className="absolute bottom-[10%] md:bottom-[15%] left-4 md:left-12 lg:left-24 max-w-4xl z-20 pointer-events-none">
            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <Badge className="bg-primary font-black uppercase text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-sm shadow-lg shadow-primary/20">Original Series</Badge>
                    <div className="flex items-center gap-1 md:gap-1.5 text-yellow-400 font-black text-[10px] md:text-sm bg-black/60 backdrop-blur-xl px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10 shadow-2xl">
                        <Star className="size-3 md:size-4 fill-current" />
                        {show.vote_average.toFixed(1)}
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white font-bold backdrop-blur-md uppercase tracking-widest text-[8px] md:text-[10px]">ULTRA HD</Badge>
                </div>
                <h1 className="font-headline text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    {show.name}
                </h1>
            </div>
        </div>
      </div>

      <div className="content-container relative -mt-20 md:-mt-48 pb-20 z-30 px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20">
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6 md:space-y-10">
            <div className="relative aspect-[2/3] w-[200px] md:w-full mx-auto md:mx-0 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-white/10 glass-card group">
                {show.posterUrl && <Image src={show.posterUrl} alt={show.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailerAvailable && (
                        <Button variant="outline" className="rounded-full h-16 w-16 md:h-24 md:w-24 p-0 border-white/20 bg-white/10 backdrop-blur-md hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500" onClick={handlePlayTrailer}>
                            <PlayCircle className="size-10 md:size-14 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-5">
                <Button onClick={handlePlayTrailer} disabled={!trailerAvailable} size="lg" className="rounded-xl md:rounded-2xl h-14 md:h-18 font-black text-lg md:text-xl shadow-2xl shadow-primary/30 group">
                    <PlayCircle className="mr-2 md:mr-3 size-5 md:size-6 fill-current transition-transform group-hover:scale-110" /> Watch Trailer
                </Button>
                <div className="flex gap-3 md:gap-4">
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-xl md:rounded-2xl h-14 md:h-18 border-white/10 glass-card text-sm md:text-lg font-bold transition-all hover:scale-105 active:scale-95" disabled={isSavedShowLoading}>
                        <Bookmark className={cn("mr-2 md:mr-3 size-5 md:size-6 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Vault' : 'Save Series'}
                    </Button>
                    <Button variant="outline" className="rounded-xl md:rounded-2xl h-14 w-14 md:h-18 md:w-18 glass-card border-white/10 hover:bg-white hover:text-black transition-colors flex-shrink-0">
                        <Layers className="size-5 md:size-6" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 border-white/5 shadow-2xl bg-secondary/10">
                    <h3 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                        <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg md:rounded-xl"><TrendingUp className="size-3 md:size-4" /></div>
                        Stream Now
                    </h3>
                    <div className="flex flex-wrap gap-3 md:gap-5">
                        {streamingProviders.map(provider => (
                            <div key={provider.provider_id} title={provider.provider_name} className="relative size-12 md:size-16 rounded-xl md:rounded-[1.25rem] overflow-hidden shadow-2xl hover:scale-110 hover:ring-4 ring-primary/50 transition-all cursor-pointer border border-white/10">
                                <Image src={getPosterUrl(provider.logo_path)!} alt={provider.provider_name} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="flex-1 space-y-10 md:space-y-16">
            <div className="space-y-6 md:space-y-10">
                <header className="space-y-6 md:space-y-8">
                    <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[10px] md:text-sm font-bold">
                        <div className="flex items-center gap-4 md:gap-8 bg-white/5 px-4 md:px-8 py-2 md:py-3.5 rounded-xl md:rounded-[1.5rem] border border-white/10 backdrop-blur-md text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 md:size-5 text-primary" />
                                <span className="tracking-tight">{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="size-4 md:size-5 text-primary" />
                                <span className="uppercase tracking-widest text-[8px] md:text-[10px]">{show.number_of_seasons} Full Seasons</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {show.genres.slice(0, 4).map(g => (
                                <Badge key={g.id} variant="secondary" className="rounded-lg md:rounded-xl px-3 md:px-6 py-1.5 md:py-2.5 glass-panel font-black border-white/5 text-[8px] md:text-[10px] uppercase tracking-widest hover:bg-primary transition-colors cursor-default">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl space-y-6 md:space-y-10">
                    <div className="relative">
                        <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-1 md:w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                        <p className="text-xl md:text-5xl font-headline font-medium text-white/95 leading-tight italic drop-shadow-2xl pl-4">
                            "{show.tagline || "The narrative evolves with every episode."}"
                        </p>
                    </div>
                    <p className="text-base md:text-2xl text-muted-foreground/90 leading-relaxed font-medium max-w-4xl">
                        {show.overview}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {show.credits.cast.slice(0, 8).map(person => (
                            <Link href={`/person/${person.id}`} key={person.credit_id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 glass-panel rounded-xl md:rounded-2xl hover:bg-white/10 transition-all border border-white/5 group shadow-xl">
                                <Avatar className="size-12 md:size-16 border-2 border-white/10 group-hover:border-primary transition-all">
                                    <AvatarImage src={getPosterUrl(person.profile_path)!} />
                                    <AvatarFallback className="bg-secondary text-primary font-black">{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="text-sm md:text-base font-black text-white group-hover:text-primary transition-colors leading-none truncate">{person.name}</p>
                                    <p className="text-[8px] md:text-[10px] text-muted-foreground truncate uppercase font-bold tracking-widest mt-1.5">{person.character}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="space-y-6 md:space-y-10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Star className="size-5 md:size-6 text-primary fill-primary" />
                            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase mb-0">Critical Hub</h2>
                        </div>
                        <Badge className="bg-secondary text-white font-black text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-sm uppercase tracking-widest border border-white/10">Community Hub</Badge>
                    </div>
                    <div className="glass-panel rounded-2xl md:rounded-[3rem] p-6 md:p-10 space-y-8 md:space-y-10 border-white/10 bg-secondary/30 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-primary/5 blur-[60px] md:blur-[100px] rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32" />
                        <div className="space-y-6 md:space-y-8 relative z-10">
                            <div className="text-center space-y-2">
                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Architect your verdict</p>
                                <div className="flex justify-center py-4 scale-125 md:scale-150 transform transition-transform hover:scale-[1.3] md:hover:scale-[1.6]">
                                    <TvShowRating showId={show.id} />
                                </div>
                            </div>
                            <Separator className="bg-white/10" />
                            <div className="relative z-10 min-h-[250px] md:min-h-[300px]">
                                <TVUserReviewsSection showId={show.id} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="space-y-8 md:space-y-12 pt-10 md:pt-20 border-t border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <Layers className="size-5 md:size-6 text-primary" />
                        <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase mb-0">Episode Guide</h2>
                    </div>
                    <Badge variant="outline" className="rounded-full px-4 md:px-6 py-1.5 border-white/20 text-muted-foreground uppercase font-black text-[8px] md:text-[10px] tracking-widest backdrop-blur-md">
                        {show.number_of_episodes} Total Episodes
                    </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:gap-8">
                    {show.seasons.filter(s => s.season_number > 0).map(season => (
                        <div key={season.id} className="group glass-panel rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500 shadow-2xl relative">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 relative z-10">
                                <div className="w-full md:w-48 aspect-[2/3] relative flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                    {season.poster_path ? (
                                        <Image src={getPosterUrl(season.poster_path)!} alt={season.name} fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <Tv className="size-8 md:size-12 text-white/10" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4 md:space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 md:space-y-2">
                                            <h3 className="font-black text-xl md:text-3xl group-hover:text-primary transition-colors leading-none text-white tracking-tighter uppercase">{season.name}</h3>
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.25em]">{season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'} Sequence</span>
                                                <Separator orientation="vertical" className="h-3 bg-white/10" />
                                                <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">{season.episode_count} Episodes</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm md:text-lg text-muted-foreground/90 leading-relaxed font-medium line-clamp-3 md:line-clamp-4">
                                        {season.overview || "Production details for this cycle are currently classified. Access will be granted upon transmission."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
