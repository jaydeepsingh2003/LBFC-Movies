'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPosterUrl, getMovieVideos, discoverMovies, discoverTvShows } from '@/lib/tmdb.client';
import { Movie, TVShow } from '@/lib/tmdb';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { MovieCard } from '../movie-card';
import { TVShowCard } from '../tv-show-card';

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
    name: 'Amazon Prime',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png',
    provider_id: 119,
  },
  {
    name: 'Disney+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/2560px-Disney%2B_logo.svg.png',
    provider_id: 337,
  },
  {
    name: 'JioCinema',
    logo: 'https://play-lh.googleusercontent.com/Ag_Pw_Id_df_vPh_Wh_vXIB9_it_sh_vto_Z_v_Wh_vXIB9_it_sh_vto_Z_v',
    provider_id: 220,
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
        setContentData(combinedContent.slice(0, 20));
      } catch (error) {
        console.error("Error fetching OTT content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [activePlatform]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-headline text-2xl font-bold tracking-tight">Trending on</h2>
          <div className="relative h-8 w-28 hidden sm:block">
            {activePlatformLogo && (
              <Image src={activePlatformLogo} alt={activePlatform} fill className="object-contain" />
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 max-w-[200px] sm:max-w-none">
          {ottPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => setActivePlatform(platform.name)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border',
                activePlatform === platform.name
                  ? 'bg-primary border-primary text-white'
                  : 'bg-secondary border-white/5 text-muted-foreground'
              )}
            >
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-40 md:w-48 flex-shrink-0 rounded-lg" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {contentData.map((item) => (
                <CarouselItem key={`${item.type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2 md:pl-4">
                  {item.type === 'movie' ? (
                    <MovieCard id={item.id} title={item.title} posterUrl={item.posterUrl} />
                  ) : (
                    <TVShowCard id={item.id} title={item.title} posterUrl={item.posterUrl} />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12 bg-background/50 backdrop-blur-sm" />
            <CarouselNext className="mr-12 bg-background/50 backdrop-blur-sm" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
