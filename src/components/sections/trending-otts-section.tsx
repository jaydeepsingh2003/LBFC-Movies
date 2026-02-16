'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPosterUrl, discoverMovies, discoverTvShows } from '@/lib/tmdb.client';
import { Movie, TVShow } from '@/lib/tmdb';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { MovieCard } from '../movie-card';
import { TVShowCard } from '../tv-show-card';
import { Clapperboard } from 'lucide-react';

interface ContentWithPoster extends Partial<Movie>, Partial<TVShow> {
  posterUrl: string | null;
  title: string;
  type: 'movie' | 'tv';
  id: number;
}

const ottPlatforms = [
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png',
    provider_id: 8,
  },
  {
    name: 'Prime Video',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png',
    provider_id: 119,
  },
  {
    name: 'Disney+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/2560px-Disney%2B_logo.svg.png',
    provider_id: 337,
  }
];

export default function TrendingOttsSection() {
  const [activePlatform, setActivePlatform] = useState(ottPlatforms[0].name);
  const [contentData, setContentData] = useState<ContentWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePlatformLogo = useMemo(() => {
    return ottPlatforms.find(p => p.name === activePlatform)?.logo;
  }, [activePlatform]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const platform = ottPlatforms.find((p) => p.name === activePlatform);
      if (!platform) {
        setIsLoading(false);
        return;
      }

      try {
        const [movieResults, tvShowResults] = await Promise.all([
          discoverMovies({ with_watch_providers: platform.provider_id.toString(), watch_region: 'IN' }),
          discoverTvShows({ with_watch_providers: platform.provider_id.toString(), watch_region: 'IN' }),
        ]);
        
        const combinedContent: ContentWithPoster[] = [
          ...movieResults.map(item => ({...item, type: 'movie' as const, title: item.title, posterUrl: getPosterUrl(item.poster_path)})),
          ...tvShowResults.map(item => ({...item, type: 'tv' as const, title: item.name, posterUrl: getPosterUrl(item.poster_path)}))
        ];

        combinedContent.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        setContentData(combinedContent.slice(0, 18));
      } catch (error) {
        console.error("OTT Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [activePlatform]);

  return (
    <section className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="section-title mb-0">
            <Clapperboard className="text-primary size-6" />
            Trending on OTT
          </h2>
          <p className="text-sm font-medium text-muted-foreground">The most watched titles on your favorite platforms today.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl overflow-x-auto no-scrollbar">
          {ottPlatforms.map((platform) => {
            const isActive = activePlatform === platform.name;
            return (
                <button
                    key={platform.name}
                    onClick={() => setActivePlatform(platform.name)}
                    className={cn(
                        'flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300',
                        isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                >
                    {platform.name}
                </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-[350px]">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-40 md:w-56 flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {contentData.map((item) => (
                <CarouselItem key={`${item.type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-4">
                  {item.type === 'movie' ? (
                    <MovieCard id={item.id} title={item.title} posterUrl={item.posterUrl} />
                  ) : (
                    <TVShowCard id={item.id} title={item.title} posterUrl={item.posterUrl} />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12 glass-panel border-none h-12 w-12 hover:bg-primary transition-all" />
            <CarouselNext className="mr-12 glass-panel border-none h-12 w-12 hover:bg-primary transition-all" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
