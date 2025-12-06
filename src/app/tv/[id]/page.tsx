
'use client';

import React, { useState, useEffect } from 'react';
import { getTvShowDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb.client';
import type { TVShowDetails, CastMember, CrewMember, WatchProvider, TVShow, TVSeason } from '@/lib/tmdb';
import { AppLayout } from '@/components/layout/app-layout';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlayCircle, Star, Calendar, Clapperboard, Tv } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVideoPlayer } from '@/context/video-provider';
import { Button } from '@/components/ui/button';
import { TVShowCard } from '@/components/tv-show-card';

interface TVShowDetailsWithMedia extends TVShowDetails {
  posterUrl: string | null;
  backdropUrl: string | null;
}

interface TVShowWithPoster extends Partial<TVShow> {
    posterUrl: string | null;
    title: string;
}

export default function TVShowDetailsPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id } = params;
  const [show, setShow] = useState<TVShowDetailsWithMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setVideoId } = useVideoPlayer();

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
  
  const usProviders = show?.['watch/providers']?.results?.US;
  const streamingProviders = usProviders?.flatrate || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-32 w-32 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!show) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">TV Show not found</h2>
          <p className="text-muted-foreground mt-2">We couldn't find details for this show.</p>
        </div>
      </AppLayout>
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
                    <p className="text-xs text-muted-foreground mt-1">{new Date(season.air_date).getFullYear()} | {season.episode_count} Episodes</p>
                    <p className="text-sm text-foreground/80 mt-2 line-clamp-4">{season.overview}</p>
                </div>
            </Card>
        ))}
    </div>
  );

  const similarShows = show.similar.results
        .map(m => ({ ...m, posterUrl: getPosterUrl(m.poster_path), title: m.name } as TVShowWithPoster))
        .filter(m => m.posterUrl);

  return (
    <AppLayout>
      <div className="relative h-96 md:h-[32rem] w-full">
        {show.backdropUrl && <Image src={show.backdropUrl} alt={show.name} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="relative -mt-48 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <Card className="overflow-hidden border-2 border-primary shadow-lg">
              <CardContent className="p-0 aspect-[2/3] relative w-full">
                {show.posterUrl && <Image src={show.posterUrl} alt={show.name} fill className="object-cover" />}
              </CardContent>
            </Card>
            <div className="flex gap-2 mt-4">
              <Button onClick={handlePlayTrailer} className="w-full" size="lg">
                <PlayCircle className="mr-2" /> Play Trailer
              </Button>
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
              <p className="text-muted-foreground text-lg">{show.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {show.genres.map(genre => <Badge key={genre.id} variant="secondary">{genre.name}</Badge>)}
              </div>
            </header>

            <p className="text-foreground/80 leading-relaxed">{show.overview}</p>
            
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2" title="TMDB User Score">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-lg">{show.vote_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 10</span>
                </div>
                <span className="hidden md:inline">&#8226;</span>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''} - {show.in_production ? 'Present' : (show.last_air_date ? new Date(show.last_air_date).getFullYear() : '')}</span>
                </div>
                <span className="hidden md:inline">&#8226;</span>
                <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    <span>{show.number_of_seasons} Seasons</span>
                </div>
                 <span className="hidden md:inline">&#8226;</span>
                <div className="flex items-center gap-2">
                    <Clapperboard className="w-4 h-4" />
                    <span>{show.number_of_episodes} Episodes</span>
                </div>
            </div>

            <section className="space-y-4 pt-8">
              <h2 className="font-headline text-2xl font-bold">Seasons</h2>
              {renderSeasons(show.seasons)}
            </section>
            
            <section className="space-y-4 pt-8">
              <h2 className="font-headline text-2xl font-bold">Cast</h2>
              {renderCreditList(show.credits.cast)}
            </section>

          </div>
        </div>
        
        {similarShows.length > 0 && (
            <div className="pt-12">
                 <div className="space-y-4">
                    <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">You Might Also Like</h2>
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
    </AppLayout>
  );
}

    