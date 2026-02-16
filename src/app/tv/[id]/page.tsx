
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTvShowDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { TVShowDetails } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Tv, Bookmark, ChevronLeft, Calendar, TrendingUp, Layers } from 'lucide-react';
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
        toast({
            variant: "destructive",
            title: "Sign in required",
            description: "Please log in to curate your TV collection.",
        });
        return;
    }

    try {
        if (isSaved) {
            await removeTvShowFromPlaylist(firestore, user.uid, show.id);
            toast({ title: "Removed from TV Vault" });
        } else {
            await saveTvShowToPlaylist(firestore, user.uid, {
                id: show.id,
                name: show.name,
                overview: show.overview,
                poster_path: show.poster_path,
            });
            toast({ title: "Saved to TV Vault" });
        }
    } catch (error) {
        console.error("Error toggling save state:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6 bg-background">
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
    <div className="relative min-h-screen bg-background">
      {/* Cinematic Backdrop Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
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
                    <Badge className="bg-primary font-black uppercase text-[10px] px-3 py-1 rounded-sm">Original Series</Badge>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                        <Star className="size-4 fill-current" />
                        {show.vote_average.toFixed(1)}
                    </div>
                </div>
                <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                    {show.name}
                </h1>
            </div>
        </div>
      </div>

      <div className="content-container relative -mt-32 md:-mt-48 pb-20 z-30">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Poster & Actions Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0 space-y-8">
            <div className="relative aspect-[2/3] w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-white/10 glass-card group">
                {show.posterUrl && <Image src={show.posterUrl} alt={show.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailerAvailable && (
                        <Button variant="outline" className="rounded-full h-20 w-20 p-0 border-white/20 bg-white/10 backdrop-blur-md hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500" onClick={handlePlayTrailer}>
                            <PlayCircle className="size-12 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <Button onClick={handlePlayTrailer} disabled={!trailerAvailable} size="lg" className="rounded-2xl h-16 font-black text-xl shadow-2xl shadow-primary/20 group">
                    <PlayCircle className="mr-3 fill-current transition-transform group-hover:scale-110" /> Watch Trailer
                </Button>
                <div className="flex gap-4">
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-2xl h-16 border-white/10 glass-card text-lg font-bold" disabled={isSavedShowLoading}>
                        <Bookmark className={cn("mr-3 size-6 transition-all", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Vault' : 'Add to Vault'}
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-16 w-16 glass-card border-white/10 hover:bg-white hover:text-black transition-colors">
                        <Layers className="size-6" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-[2rem] p-8 space-y-6 border-white/5 shadow-2xl">
                    <h3 className="font-black text-xs uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg"><Tv className="size-4 text-primary" /></div>
                        Stream Now
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
                                <span>{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="size-4 text-primary" />
                                <span className="uppercase tracking-widest text-[10px]">{show.number_of_seasons} Seasons</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {show.genres.slice(0, 3).map(g => (
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
                            {show.tagline || "A compelling series that demands your attention."}
                        </p>
                    </div>
                    <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium">
                        {show.overview}
                    </p>
                </div>
            </div>

            {/* Sub-sections: Cast & Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8">
                <section className="space-y-8">
                    <h2 className="section-title text-3xl font-black tracking-tighter">Created By & Cast</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {show.credits.cast.slice(0, 6).map(person => (
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
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Rate this Series</p>
                            <div className="flex justify-center py-2 scale-125">
                                <TvShowRating showId={show.id} />
                            </div>
                        </div>
                        <Separator className="bg-white/5" />
                        <TVUserReviewsSection showId={show.id} />
                    </div>
                </section>
            </div>

            {/* Seasons Grid */}
            <section className="space-y-10 pt-16 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <h2 className="section-title text-3xl font-black tracking-tighter">Seasons</h2>
                    <Badge variant="outline" className="rounded-full px-4 border-white/20 text-muted-foreground uppercase font-black text-[10px] tracking-widest">{show.number_of_episodes} Total Episodes</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {show.seasons.filter(s => s.season_number > 0).map(season => (
                        <div key={season.id} className="flex flex-col gap-4 p-6 glass-panel rounded-[2rem] overflow-hidden group hover:bg-white/5 transition-all border-white/5 shadow-xl">
                            <div className="flex gap-6">
                                <div className="w-28 aspect-[2/3] relative flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                    {season.poster_path ? (
                                        <Image src={getPosterUrl(season.poster_path)!} alt={season.name} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <Tv className="size-10 text-muted-foreground/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="space-y-1">
                                        <h3 className="font-black text-xl group-hover:text-primary transition-colors leading-tight">{season.name}</h3>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'} • {season.episode_count} Episodes</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed font-medium">{season.overview || "No overview available for this season."}</p>
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
