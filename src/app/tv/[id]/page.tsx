
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTvShowDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { TVShowDetails, TVShow } from '@/lib/tmdb';
import { getExternalTvRatings } from '@/ai/flows/get-external-tv-ratings';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Tv, Bookmark, ChevronLeft, Info, Calendar } from 'lucide-react';
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

export default function TVShowDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [show, setShow] = useState<TVShowDetailsWithMedia | null>(null);
  const [externalRatings, setExternalRatings] = useState<ExternalRatings | null>(null);
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

        // Fetch AI External Ratings gracefully
        try {
            const ratingsResult = await getExternalTvRatings({ tvShowTitle: showDetails.name });
            setExternalRatings(ratingsResult);
        } catch (aiError) {
            console.warn("AI Ratings fetch skipped or failed", aiError);
        }

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

  const streamingProviders = show?.['watch/providers']?.results?.IN?.flatrate || [];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Retrieving Series Intel...</p>
      </div>
    );
  }

  if (!show) return <div className="text-center py-20 font-headline text-2xl font-bold">Show unavailable.</div>;

  const trailerAvailable = !!show?.videos?.results?.find(v => v.type === 'Trailer');

  return (
    <div className="relative min-h-screen">
      {/* Backdrop Section */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        {show.backdropUrl && <Image src={show.backdropUrl} alt={show.name} fill className="object-cover" priority />}
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
                {show.posterUrl && <Image src={show.posterUrl} alt={show.name} fill className="object-cover" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailerAvailable && (
                        <Button variant="outline" className="rounded-full h-16 w-16 p-0 border-white/20 bg-white/10 backdrop-blur-md" onClick={handlePlayTrailer}>
                            <PlayCircle className="size-10 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                <Button onClick={handlePlayTrailer} disabled={!trailerAvailable} size="lg" className="rounded-xl h-14 font-black text-lg shadow-xl shadow-primary/20">
                    <PlayCircle className="mr-3 fill-current" /> Watch Trailer
                </Button>
                <div className="flex gap-3">
                    <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} className="flex-1 rounded-xl h-14 border-white/10 glass-card" disabled={isSavedShowLoading}>
                        <Bookmark className={cn("mr-2 size-5", isSaved && "fill-primary text-primary")} /> 
                        {isSaved ? 'In Vault' : 'Add to Vault'}
                    </Button>
                    <Button variant="outline" className="rounded-xl h-14 w-14 glass-card border-white/10">
                        <Info className="size-5" />
                    </Button>
                </div>
            </div>

            {streamingProviders.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Info className="size-4" /> Stream Now
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
                        {show.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                        <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                            <Star className="size-4 fill-current" />
                            <span>{show.vote_average.toFixed(1)} TMDB</span>
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
                            <span>{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                            <Badge variant="outline" className="border-none p-0 text-muted-foreground">
                                {show.number_of_seasons} Seasons
                            </Badge>
                        </div>
                        {show.genres.slice(0, 3).map(g => (
                            <Badge key={g.id} variant="secondary" className="rounded-full px-4 py-1.5 glass-card font-bold border-none">
                                {g.name}
                            </Badge>
                        ))}
                    </div>
                </header>

                <div className="max-w-3xl">
                    <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                        {show.tagline || "A compelling series that demands your attention."}
                    </p>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-medium">
                        {show.overview}
                    </p>
                </div>
            </div>

            {/* Sub-sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <section className="space-y-6">
                    <h2 className="section-title">Created By & Cast</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {show.credits.cast.slice(0, 6).map(person => (
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
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Rate this Series</p>
                            <div className="flex justify-center py-2">
                                <TvShowRating showId={show.id} />
                            </div>
                        </div>
                        <Separator className="bg-white/5" />
                        <TVUserReviewsSection showId={show.id} />
                    </div>
                </section>
            </div>

            {/* Seasons Grid */}
            <section className="space-y-6 pt-12">
                <h2 className="section-title">Seasons</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {show.seasons.filter(s => s.season_number > 0).map(season => (
                        <div key={season.id} className="flex gap-4 p-4 glass-panel rounded-2xl overflow-hidden group hover:bg-white/5 transition-all">
                            <div className="w-24 aspect-[2/3] relative flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                                {season.poster_path ? (
                                    <Image src={getPosterUrl(season.poster_path)!} alt={season.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                        <Tv className="size-8 text-muted-foreground/20" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-bold text-base group-hover:text-primary transition-colors">{season.name}</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'} • {season.episode_count} Episodes</p>
                                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-2">{season.overview || "No overview available for this season."}</p>
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
