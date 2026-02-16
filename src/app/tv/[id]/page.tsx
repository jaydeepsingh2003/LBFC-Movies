'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTvShowDetails, getPosterUrl, getBackdropUrl, getLogoUrl } from '@/lib/tmdb.client';
import type { TVShowDetails, CastMember, CrewMember, TVShow, TVSeason } from '@/lib/tmdb';
import { getExternalTvRatings } from '@/ai/flows/get-external-tv-ratings';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Tv, Bookmark, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';
import { TVShowCard } from '@/components/tv-show-card';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveTvShowToPlaylist, removeTvShowFromPlaylist } from '@/firebase/firestore/tv-playlists';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { TvShowRating } from '@/components/tv-show-rating';
import { TVUserReviewsSection } from '@/components/tv-user-reviews-section';
import { Separator } from '@/components/ui/separator';

interface TVShowDetailsWithMedia extends TVShowDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
}

interface TVShowWithPoster extends Partial<TVShow> {
    posterUrl: string | null;
    title: string;
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
      try {
        const showId = parseInt(id, 10);
        const showDetails = await getTvShowDetails(showId);
        
        const showWithMedia = {
          ...showDetails,
          posterUrl: getPosterUrl(showDetails.poster_path),
          backdropUrl: getBackdropUrl(showDetails.backdrop_path),
        };
        setShow(showWithMedia);

        const ratingsResult = await getExternalTvRatings({ tvShowTitle: showDetails.name });
        setExternalRatings(ratingsResult);


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
            title: "Please log in",
            description: "You must be logged in to save shows.",
        });
        return;
    }

    try {
        if (isSaved) {
            await removeTvShowFromPlaylist(firestore, user.uid, show.id);
            toast({ title: "Show removed from your playlist." });
        } else {
            await saveTvShowToPlaylist(firestore, user.uid, {
                id: show.id,
                name: show.name,
                overview: show.overview,
                poster_path: show.poster_path,
            });
            toast({ title: "Show added to your playlist!" });
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
  
  const usProviders = show?.['watch/providers']?.results?.US;
  const streamingProviders = usProviders?.flatrate || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-32 w-32 animate-spin text-primary" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">TV Show not found</h2>
        <p className="text-muted-foreground mt-2">We couldn't find details for this show.</p>
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
  
  const renderSeasons = (seasons: TVSeason[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.filter(s => s.season_number > 0).map(season => (
             <Card key={season.id} className="flex gap-4 overflow-hidden bg-secondary">
                <div className="w-1/3 aspect-[2/3] relative flex-shrink-0">
                     {season.poster_path ? (
                        <Image src={getPosterUrl(season.poster_path)} alt={season.name} fill className="object-cover" />
                     ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Tv className="w-8 h-8 text-muted-foreground" />
                        </div>
                     )}
                </div>
                <div className="p-4 flex flex-col">
                    <h3 className="font-bold text-lg leading-tight">{season.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{season.air_date ? new Date(season.air_date).getFullYear() : ''} | {season.episode_count} Episodes</p>
                    <p className="text-sm text-foreground/80 mt-2 line-clamp-4">{season.overview}</p>
                </div>
            </Card>
        ))}
    </div>
  );

  const similarShows = show.similar.results
        .map(m => ({ ...m, posterUrl: getPosterUrl(m.poster_path), title: m.name } as TVShowWithPoster))
        .filter(m => m.posterUrl);

  const trailerAvailable = !!show?.videos?.results?.find(v => v.type === 'Trailer');

  return (
    <div className="relative">
      <div className="relative h-96 md:h-[32rem] w-full">
        {show.backdropUrl && <Image src={show.backdropUrl} alt={show.name} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        
        {/* Back Button */}
        <Link href="/tv" className="absolute top-8 left-4 md:left-8 z-20">
            <Button variant="ghost" className="glass-card rounded-full gap-2 text-white hover:bg-primary transition-all">
                <ChevronLeft className="size-5" /> Back to TV Hub
            </Button>
        </Link>
      </div>

      <div className="relative -mt-48 px-4 md:px-8 pb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-primary group glass-card">
                {show.posterUrl && <Image src={show.posterUrl} alt={show.name} fill className="object-cover" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {trailerAvailable && (
                        <Button variant="outline" className="rounded-full h-16 w-16 p-0 border-white/20 bg-white/10 backdrop-blur-md" onClick={handlePlayTrailer}>
                            <PlayCircle className="size-10 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handlePlayTrailer} className="flex-1" size="lg" disabled={!trailerAvailable}>
                <PlayCircle className="mr-2" /> Watch Trailer
              </Button>
              {user && (
                <Button onClick={handleSaveToggle} variant={isSaved ? "secondary" : "outline"} size="lg" disabled={isSavedShowLoading} className="glass-card border-white/10">
                  <Bookmark className={cn("size-5", isSaved && "fill-primary text-primary")} />
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
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">{show.name}</h1>
              <p className="text-muted-foreground text-lg italic">{show.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {show.genres.map(genre => <Badge key={genre.id} variant="secondary" className="glass-card border-none">{genre.name}</Badge>)}
              </div>
            </header>
            
            {user && (
              <div className="space-y-2 glass-panel p-4 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Your Rating</h3>
                <TvShowRating showId={show.id} />
              </div>
            )}

            <p className="text-foreground/80 leading-relaxed text-lg max-w-4xl">{show.overview}</p>
            
            <div className="flex items-center flex-wrap gap-4 text-sm font-bold">
                <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{show.vote_average.toFixed(1)}</span>
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

                <div className="bg-white/5 px-3 py-1.5 rounded-full text-muted-foreground">
                    {show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''} - {show.in_production ? 'Present' : (show.last_air_date ? new Date(show.last_air_date).getFullYear() : '')}
                </div>
                <div className="bg-white/5 px-3 py-1.5 rounded-full text-muted-foreground">
                    {show.number_of_seasons} Seasons
                </div>
            </div>

            <Separator className="bg-white/10" />
            
            {show.created_by && show.created_by.length > 0 && (
                 <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Created by</h3>
                    <div className="flex flex-wrap gap-4">
                    {show.created_by.map(creator => (
                        <Link href={`/person/${creator.id}`} key={creator.credit_id}>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getPosterUrl(creator.profile_path)} />
                                    <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm">{creator.name}</span>
                            </div>
                        </Link>
                    ))}
                    </div>
                </div>
            )}

            <TVUserReviewsSection showId={show.id} />

            <section className="space-y-4 pt-8">
              <h2 className="section-title">Seasons</h2>
              {renderSeasons(show.seasons)}
            </section>
            
            <section className="space-y-4 pt-8">
              <h2 className="section-title">Cast</h2>
              {renderCreditList(show.credits.cast)}
            </section>

          </div>
        </div>
        
        {similarShows.length > 0 && (
            <div className="pt-12">
                 <div className="space-y-4">
                    <h2 className="section-title">You Might Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {similarShows.map((s) => (
                           s.id ? (
                            <TVShowCard key={s.id} id={s.id} title={s.title} posterUrl={s.posterUrl} />
                           ) : null
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
