
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { getAiringTodayTvShows, getOnTheAirTvShows, getPopularTvShows, getTopRatedTvShows, getPosterUrl } from '@/lib/tmdb.client';
import type { TVShow } from '@/lib/tmdb';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { TVShowCard } from '@/components/tv-show-card';
import { Skeleton } from '@/components/ui/skeleton';
import EnglishTvSection from '@/components/sections/english-tv-section';
import HindiTvSection from '@/components/sections/hindi-tv-section';
import KannadaTvSection from '@/components/sections/kannada-tv-section';

interface TVShowWithPoster extends Partial<TVShow> {
    posterUrl: string | null;
    title: string;
}

interface TvCarouselProps {
  title: string;
  shows: TVShowWithPoster[];
  isLoading: boolean;
}

function TvCarousel({ title, shows, isLoading }: TvCarouselProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-48 md:w-56 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {shows.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {shows.map((show, index) => (
              <CarouselItem key={show.id || index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                <TVShowCard id={show.id!} title={show.title} posterUrl={show.posterUrl} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12 bg-background/50 hover:bg-background" />
          <CarouselNext className="mr-12 bg-background/50 hover:bg-background" />
        </Carousel>
      ) : (
        <p className="text-muted-foreground">No shows to display right now.</p>
      )}
    </div>
  );
}

export default function TVPage() {
    const [airingToday, setAiringToday] = useState<TVShowWithPoster[]>([]);
    const [onTheAir, setOnTheAir] = useState<TVShowWithPoster[]>([]);
    const [popular, setPopular] = useState<TVShowWithPoster[]>([]);
    const [topRated, setTopRated] = useState<TVShowWithPoster[]>([]);
    const [loadingState, setLoadingState] = useState({
        airingToday: true,
        onTheAir: true,
        popular: true,
        topRated: true,
    });

    useEffect(() => {
        const fetchAllShows = async () => {
            const fetchCategory = async (fetchFn: () => Promise<TVShow[]>, category: keyof typeof loadingState) => {
                try {
                    const shows = await fetchFn();
                    return shows.map(s => ({ ...s, posterUrl: getPosterUrl(s.poster_path), title: s.name }));
                } catch (error) {
                    console.error(`Failed to fetch ${category} shows:`, error);
                    return [];
                } finally {
                    setLoadingState(prev => ({...prev, [category]: false}));
                }
            };

            fetchCategory(getAiringTodayTvShows, 'airingToday').then(setAiringToday);
            fetchCategory(getOnTheAirTvShows, 'onTheAir').then(setOnTheAir);
            fetchCategory(getPopularTvShows, 'popular').then(setPopular);
            fetchCategory(getTopRatedTvShows, 'topRated').then(setTopRated);
        };
        fetchAllShows();
    }, []);

  return (
    <AppLayout>
      <div className="space-y-12 py-8">
        <header className="space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">TV Shows</h1>
            <p className="text-muted-foreground">Browse and discover new TV series.</p>
        </header>
        
        <TvCarousel title="Airing Today" shows={airingToday} isLoading={loadingState.airingToday} />
        <TvCarousel title="Currently On The Air" shows={onTheAir} isLoading={loadingState.onTheAir} />
        <TvCarousel title="Popular TV Shows" shows={popular} isLoading={loadingState.popular} />
        <TvCarousel title="Top Rated TV Shows" shows={topRated} isLoading={loadingState.topRated} />

        <div className="space-y-12">
            <EnglishTvSection />
            <HindiTvSection />
            <KannadaTvSection />
        </div>
      </div>
    </AppLayout>
  );
}
